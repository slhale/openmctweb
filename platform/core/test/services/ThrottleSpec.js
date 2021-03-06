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
/*global define,Promise,describe,it,expect,beforeEach,waitsFor,jasmine*/

define(
    ["../../src/services/Throttle"],
    function (Throttle) {
        "use strict";

        describe("The 'throttle' service", function () {
            var throttle,
                mockTimeout,
                mockFn,
                mockPromise;

            beforeEach(function () {
                mockTimeout = jasmine.createSpy("$timeout");
                mockPromise = jasmine.createSpyObj("promise", ["then"]);
                mockFn = jasmine.createSpy("fn");
                mockTimeout.andReturn(mockPromise);
                throttle = new Throttle(mockTimeout);
            });

            it("provides functions which run on a timeout", function () {
                var throttled = throttle(mockFn);
                // Verify precondition: Not called at throttle-time
                expect(mockTimeout).not.toHaveBeenCalled();
                expect(throttled()).toEqual(mockPromise);
                expect(mockTimeout).toHaveBeenCalledWith(mockFn, 0, false);
            });

            it("schedules only one timeout at a time", function () {
                var throttled = throttle(mockFn);
                throttled();
                throttled();
                throttled();
                expect(mockTimeout.calls.length).toEqual(1);
            });

            it("schedules additional invocations after resolution", function () {
                var throttled = throttle(mockFn);
                throttled();
                mockPromise.then.mostRecentCall.args[0](); // Resolve timeout
                throttled();
                mockPromise.then.mostRecentCall.args[0]();
                throttled();
                expect(mockTimeout.calls.length).toEqual(3);
            });
        });
    }
);
