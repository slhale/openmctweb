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
/*global define*/

/**
 * This bundle provides infrastructure and utility services for handling
 * telemetry data.
 * @namespace platform/telemetry
 */
define(
    [],
    function () {
        "use strict";

        /**
         * Request telemetry data.
         * @param {TelemetryRequest[]} requests and array of
         *        requests to be handled
         * @returns {Promise} a promise for telemetry data
         *          which may (or may not, depending on
         *          availability) satisfy the requests
         * @method TelemetryService#requestTelemetry
         */
        /**
         * Subscribe to streaming updates to telemetry data.
         * The provided callback will be invoked as new
         * telemetry becomes available; as an argument, it
         * will receive an object of key-value pairs, where
         * keys are source identifiers and values are objects
         * of key-value pairs, where keys are point identifiers
         * and values are TelemetrySeries objects containing
         * the latest streaming telemetry.
         * @param {Function} callback the callback to invoke
         * @param {TelemetryRequest[]} requests an array of
         *        requests to be subscribed upon
         * @returns {Function} a function which can be called
         *        to unsubscribe
         * @method TelmetryService#subscribe
         */

        /**
         * A telemetry aggregator makes many telemetry providers
         * appear as one.
         *
         * @memberof platform/telemetry
         * @constructor
         */
        function TelemetryAggregator($q, telemetryProviders) {
            this.$q = $q;
            this.telemetryProviders = telemetryProviders;
        }

        // Merge the results from many providers into one
        // result object.
        function mergeResults(results) {
            var merged = {};

            results.forEach(function (result) {
                Object.keys(result).forEach(function (k) {
                    merged[k] = result[k];
                });
            });

            return merged;
        }

        // Request telemetry from all providers; once they've
        // responded, merge the results into one result object.
        TelemetryAggregator.prototype.requestTelemetry = function (requests) {
            return this.$q.all(this.telemetryProviders.map(function (provider) {
                return provider.requestTelemetry(requests);
            })).then(mergeResults);
        };

        // Subscribe to updates from all providers
        TelemetryAggregator.prototype.subscribe = function (callback, requests) {
            var unsubscribes = this.telemetryProviders.map(function (provider) {
                return provider.subscribe(callback, requests);
            });

            // Return an unsubscribe function that invokes unsubscribe
            // for all providers.
            return function () {
                unsubscribes.forEach(function (unsubscribe) {
                    if (unsubscribe) {
                        unsubscribe();
                    }
                });
            };
        };


        return TelemetryAggregator;
    }
);
