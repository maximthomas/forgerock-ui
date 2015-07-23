/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright (c) 2014 ForgeRock AS. All Rights Reserved
 *
 * The contents of this file are subject to the terms
 * of the Common Development and Distribution License
 * (the License). You may not use this file except in
 * compliance with the License.
 *
 * You can obtain a copy of the License at
 * http://forgerock.org/license/CDDLv1.0.html
 * See the License for the specific language governing
 * permission and limitations under the License.
 *
 * When distributing Covered Code, include this CDDL
 * Header Notice in each file and include the License file
 * at http://forgerock.org/license/CDDLv1.0.html
 * If applicable, add the following below the CDDL Header,
 * with the fields enclosed by brackets [] replaced by
 * your own identifying information:
 * "Portions Copyrighted [year] [name of copyright owner]"
 */

/*global require, define, QUnit */

define([
        "sinon",
        "org/forgerock/commons/ui/common/main/Configuration",
        "org/forgerock/commons/ui/common/util/Constants",
        "org/forgerock/commons/ui/common/main/EventManager",
        "org/forgerock/commons/ui/common/util/ModuleLoader",
        "org/forgerock/commons/ui/common/main/Router"
    ], function (sinon, conf, Constants, EventManager, ModuleLoader, Router) {
    return {
        executeAll: function (server, loggedUser) {

            module('User Tests');

            //Test 1: Update User Info

            QUnit.asyncTest("Update User Info", function () {

                conf.loggedUser = loggedUser;
                ModuleLoader.load("UserProfileView").then(function (userProfileView) {

                    delete userProfileView.route; // necessary to prevent some error-checking code from causing problems in this context

                    userProfileView.render([],function() {

                        var testVals = {
                                uid                 : 'Username',
                                givenName           : 'John',
                                mail                : 'test@test.com',
                                sn                  : 'Doe',
                                telephoneNumber     : '123456789'
                            },
                            modifiedUser = _.extend(_.clone(conf.loggedUser), testVals);

                        // Testing inputs
                        QUnit.ok($('input[name="saveButton"]', userProfileView.$el).length          , "Update button appears to be defined");
                        QUnit.ok($('input[name="resetButton"]', userProfileView.$el).length         , "Reset button appears to be defined");
                        QUnit.ok($('input[name="uid"]', userProfileView.$el).length                 , "Username input appears to be defined");
                        QUnit.ok($('input[name="givenName"]', userProfileView.$el).length           , "First name input appears to be defined");
                        QUnit.ok($('input[name="mail"]', userProfileView.$el).length                , "Email address input appears to be defined");
                        QUnit.ok($('input[name="sn"]', userProfileView.$el).length                  , "Last Name input appears to be defined");
                        QUnit.ok($('input[name="telephoneNumber"]', userProfileView.$el).length     , "Mobile Phone input appears to be defined");


                       // Testing user data
                        QUnit.equal($('input[name="uid"]', userProfileView.$el).val(), conf.loggedUser.uid                          , "Username populated");
                        QUnit.equal($('input[name="givenName"]', userProfileView.$el).val(), conf.loggedUser.givenName              , "First name populated");
                        QUnit.equal($('input[name="mail"]', userProfileView.$el).val(), conf.loggedUser.mail                        , "Email address populated");
                        QUnit.equal($('input[name="sn"]', userProfileView.$el).val(), conf.loggedUser.sn                            , "Last Name populated");
                        QUnit.equal($('input[name="telephoneNumber"]', userProfileView.$el).val(), conf.loggedUser.telephoneNumber  , "Mobile Phone populated");


                        // Testing validation

                        QUnit.equal($('input[name="givenName"]', userProfileView.$el).attr('data-validation-status'),          'ok', 'First name input passes validation');
                        QUnit.equal($('input[name="mail"]', userProfileView.$el).attr('data-validation-status'),               'ok', 'Email address input passes validation');
                        QUnit.equal($('input[name="sn"]', userProfileView.$el).attr('data-validation-status'),                 'ok', 'Last Name input passes validation');
                        QUnit.equal($('input[name="telephoneNumber"]', userProfileView.$el).attr('data-validation-status'),    'ok', 'Mobile Phone input passes validation');

                        //Testing Buttons

                        $('input[name="uid"]', userProfileView.$el).val(testVals.uid).trigger('change');
                        $('input[name="givenName"]', userProfileView.$el).val(testVals.givenName).trigger('change');
                        $('input[name="mail"]', userProfileView.$el).val(testVals.mail).trigger('change');
                        $('input[name="sn"]', userProfileView.$el).val(testVals.sn).trigger('change');
                        $('input[name="telephoneNumber"]', userProfileView.$el).val(testVals.telephoneNumber).trigger('change');

                        //clicking submit button

                        EventManager.subscribeTo(Constants.EVENT_DISPLAY_MESSAGE_REQUEST).then(function (message) {
                            QUnit.equal(message, "profileUpdateSuccessful", "Correct Update Message displayed");

                            QUnit.equal(conf.loggedUser.uid, testVals.uid                             , "Username changed");
                            QUnit.equal(conf.loggedUser.givenName, testVals.givenName                 , "First name changed");
                            QUnit.equal(conf.loggedUser.mail, testVals.mail                           , "Email changed");
                            QUnit.equal(conf.loggedUser.sn, testVals.sn                               , "Last Name changed");
                            QUnit.equal(conf.loggedUser.telephoneNumber, testVals.telephoneNumber     , "Mobile Phone changed");

                            QUnit.ok(_.isEqual(conf.loggedUser, modifiedUser)                         , "User object doesn't have any unexpected changes");

                            //reset button

                            $('input[name="uid"]', userProfileView.$el).val('AnotherUsername').trigger('change');
                            $('input[name="givenName"]', userProfileView.$el).val('Jane').trigger('change');
                            $('input[name="mail"]', userProfileView.$el).val('test2@test.com').trigger('change');
                            $('input[name="sn"]', userProfileView.$el).val('Doe').trigger('change');
                            $('input[name="telephoneNumber"]', userProfileView.$el).val('987654321').trigger('change');

                            //clicking reset button
                            $('input[name="resetButton"]', userProfileView.$el).trigger('click');

                            QUnit.equal($('input[name="uid"]', userProfileView.$el).val(), testVals.uid                             , "Username was reset");
                            QUnit.equal($('input[name="givenName"]', userProfileView.$el).val(), testVals.givenName                 , "First name was reset");
                            QUnit.equal($('input[name="mail"]', userProfileView.$el).val(), testVals.mail                           , "Email was reset");
                            QUnit.equal($('input[name="sn"]', userProfileView.$el).val(), testVals.sn                               , "Last Name was reset");
                            QUnit.equal($('input[name="telephoneNumber"]', userProfileView.$el).val(), testVals.telephoneNumber     , "Mobile Phone was reset");

                            QUnit.start();

                        });

                        $('input[name="saveButton"]', userProfileView.$el).trigger('click');

                    });

                });

            });

            QUnit.test("Client-side Validators", function () {
                var validatorsManager = require("org/forgerock/commons/ui/common/main/ValidatorsManager"),
                    userDelegate = require("UserDelegate"),
                    testElement = $('<div><input data-validator="resetPasswordCorrectLogin"></div>'),
                    spy;

                    validatorsManager.bindValidators(testElement);


                    userDelegate.getSecurityQuestionForUserName = function (value, successCallback, errorCallback) {
                        if (value === "testUser") {
                            successCallback(1);
                        } else {
                            errorCallback();
                        }
                    };

                    spy = sinon.spy(userDelegate, "getSecurityQuestionForUserName");

                    testElement.find("input").val("t").trigger("keyup");
                    QUnit.equal(spy.callCount, 0, "Delegate function should not be called after keyup event");

                    testElement.find("input").val("test").trigger("blur");
                    QUnit.equal(spy.callCount, 1, "Delegate function should have been called once after keyup event");
                    QUnit.equal(testElement.find("input").attr('data-validation-status'), "error", "Validation status should be error when provided with incorrect value");

                    testElement.find("input").val("testUser").trigger("blur");
                    QUnit.equal(testElement.find("input").attr('data-validation-status'), "ok", "Validation status should be ok when provided with correct value");

            });


            QUnit.asyncTest("Unauthorized Request Behavior", function () {
                conf.loggedUser = loggedUser;
                delete conf.globalData.authorizationFailurePending;

                ModuleLoader.load("LoginDialog").then(function (loginDialog) {

                    // stub the loginDialog because we don't actually care about its contents, just that it gets called
                    sinon.stub(loginDialog, 'render', function (args, callback) {
                        if (callback) {
                            callback();
                        }
                    });

                    QUnit.ok(!loginDialog.render.called, "Login Dialog render function has not yet been called");
                    EventManager.sendEvent(Constants.EVENT_CHANGE_VIEW, {
                        route: Router.configuration.routes.profile
                    }).then(function () {

                        EventManager.sendEvent(Constants.EVENT_UNAUTHORIZED, {error: {type:"POST"} }).then(function () {
                            QUnit.ok(conf.loggedUser !== null, "User info should be retained after UNAUTHORIZED POST error");
                            QUnit.ok(loginDialog.render.calledOnce, "LoginDialog render function was called once");
                            loginDialog.render.restore();

                            delete conf.globalData.authorizationFailurePending;

                            EventManager.sendEvent(Constants.EVENT_UNAUTHORIZED, {error: {type:"GET"} }).then(function () {
                                QUnit.ok(conf.loggedUser === null, "User info should be discarded after UNAUTHORIZED GET error");
                                QUnit.ok(conf.gotoURL === "#profile/", "gotoURL should be preserved after UNAUTHORIZED GET error");
                                QUnit.equal(window.location.hash, "#login/", "Redirected to main login page")
                                delete conf.gotoURL;
                                QUnit.start();
                            });

                        });

                    });

                })
            });

        }
    };
});
