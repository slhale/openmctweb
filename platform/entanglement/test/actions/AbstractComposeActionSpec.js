/*****************************************************************************
 * Open MCT Web, Copyright (c) 2014-2015, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

/*global define,describe,beforeEach,it,jasmine,expect */

define(
    [
        '../../src/actions/AbstractComposeAction',
        '../services/MockCopyService',
        '../DomainObjectFactory'
    ],
    function (AbstractComposeAction, MockCopyService, domainObjectFactory) {
        "use strict";

        describe("Move/copy/link Actions", function () {

            var action,
                locationService,
                locationServicePromise,
                composeService,
                context,
                selectedObject,
                selectedObjectContextCapability,
                currentParent,
                newParent;

            beforeEach(function () {
                selectedObjectContextCapability = jasmine.createSpyObj(
                    'selectedObjectContextCapability',
                    [
                        'getParent'
                    ]
                );

                selectedObject = domainObjectFactory({
                    name: 'selectedObject',
                    model: {
                        name: 'selectedObject'
                    },
                    capabilities: {
                        context: selectedObjectContextCapability
                    }
                });

                currentParent = domainObjectFactory({
                    name: 'currentParent'
                });

                selectedObjectContextCapability
                    .getParent
                    .andReturn(currentParent);

                newParent = domainObjectFactory({
                    name: 'newParent'
                });

                locationService = jasmine.createSpyObj(
                    'locationService',
                    [
                        'getLocationFromUser'
                    ]
                );

                locationServicePromise = jasmine.createSpyObj(
                    'locationServicePromise',
                    [
                        'then'
                    ]
                );

                locationService
                    .getLocationFromUser
                    .andReturn(locationServicePromise);

                composeService = new MockCopyService();
            });


            describe("with context from context-action", function () {
                beforeEach(function () {
                    context = {
                        domainObject: selectedObject
                    };

                    action = new AbstractComposeAction(
                        locationService,
                        composeService,
                        context,
                        "Compose"
                    );
                });

                it("initializes happily", function () {
                    expect(action).toBeDefined();
                });

                describe("when performed it", function () {
                    beforeEach(function () {
                        action.perform();
                    });

                    it("prompts for location", function () {
                        expect(locationService.getLocationFromUser)
                            .toHaveBeenCalledWith(
                                "Compose selectedObject to a new location",
                                "Compose To",
                                jasmine.any(Function),
                                currentParent
                            );
                    });

                    it("waits for location from user", function () {
                        expect(locationServicePromise.then)
                            .toHaveBeenCalledWith(jasmine.any(Function));
                    });

                    it("copies object to selected location", function () {
                        locationServicePromise
                            .then
                            .mostRecentCall
                            .args[0](newParent);

                        expect(composeService.perform)
                            .toHaveBeenCalledWith(selectedObject, newParent);
                    });
                });
            });

            describe("with context from drag-drop", function () {
                beforeEach(function () {
                    context = {
                        selectedObject: selectedObject,
                        domainObject: newParent
                    };

                    action = new AbstractComposeAction(
                        locationService,
                        composeService,
                        context,
                        "Compose"
                    );
                });

                it("initializes happily", function () {
                    expect(action).toBeDefined();
                });


                it("performs copy immediately", function () {
                    action.perform();
                    expect(composeService.perform)
                        .toHaveBeenCalledWith(selectedObject, newParent);
                });
            });
        });
    }
);
