// ==UserScript==
// @name         Dynamic Trace ID Linker for Apollo GraphQL Studio
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Make x-otel-trace-id clickable to navigate to its SignalFx trace page on dynamic content.
// @author       You
// @match        https://studio.apollographql.com/graph/caredotcom-federated/variant/prod/insights*
// @grant        GM_getValue
// @grant        GM_setValue
//
// ==/UserScript==

(function() {
    'use strict';
 
    BASE_URL = 'https://care.signalfx.com/#/apm/traces/');

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!mutation.addedNodes) return;

            mutation.addedNodes.forEach(function(node) {
                // Check if the added node is a table or contains a table
                if (node.nodeType === 1 && (node.tagName === 'TABLE' || node.querySelector('table'))) {
                    makeTraceIdClickable();
                }
            });
        });
    });

    function makeTraceIdClickable() {
        document.querySelectorAll('table tr').forEach(function(row) {
            const label = row.querySelector('td span');
            if (label && label.innerText.trim() === 'x-otel-trace-id') {
                const traceIdCell = row.querySelector('td.text-placeholder');
                if (traceIdCell && !traceIdCell.hasAttribute('data-trace-link-added')) {
                    const traceId = traceIdCell.innerText.trim();
                    const link = document.createElement('a');
                    link.setAttribute('href', `${BASE_URL}${traceId}`);
                    link.setAttribute('target', '_blank');
                    link.style.color = 'blue';
                    link.style.textDecoration = 'underline';
                    link.innerText = traceId;

                    // Clear the cell and append the anchor element
                    traceIdCell.innerHTML = '';
                    traceIdCell.appendChild(link);
                    traceIdCell.setAttribute('data-trace-link-added', 'true'); // Mark as processed
                }
            }
        });
    }

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
