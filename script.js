document.getElementById('getInfoBtn').addEventListener('click', function() {
    const infoGrid = document.querySelector('.info-grid');
    const infoDisplay = document.getElementById('infoDisplay');

    infoGrid.innerHTML = ''; // Clear previous info
    infoDisplay.classList.add('loading'); // Add loading class

    // Simulate a slight delay (optional)
    setTimeout(() => {
        infoDisplay.classList.remove('loading'); // Remove loading class

        // 1. User Agent
        const userAgent = navigator.userAgent;
        const osInfo = parseOSFromUserAgent(userAgent);
        createInfoItem(infoGrid, 'Operating System', osInfo || 'Unknown', userAgent); // Pass userAgent as detail
        createInfoItem(infoGrid, 'User Agent', userAgent, userAgent);

        // 2. Platform
        createInfoItem(infoGrid, 'Platform', navigator.platform, navigator.platform); // Example detail is same as main info

        // 3. Language
        createInfoItem(infoGrid, 'Language', navigator.language, navigator.language);

        // 4. Cookies Enabled
        createInfoItem(infoGrid, 'Cookies Enabled', navigator.cookieEnabled ? 'Yes' : 'No', navigator.cookieEnabled ? 'Cookies are enabled in this browser.' : 'Cookies are disabled.');

        // 5. Online Status
        createInfoItem(infoGrid, 'Online', navigator.onLine ? 'Yes' : 'No', navigator.onLine ? 'You are currently online.' : 'You are currently offline.');

        // 6. Battery API
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const batteryLevel = (battery.level * 100).toFixed(0) + '%';
                const batteryCharging = battery.charging ? 'Yes' : 'No';
                createInfoItem(infoGrid, 'Battery Level', batteryLevel, `Level: ${batteryLevel}, Charging: ${batteryCharging}`); // Combined detail
                createInfoItem(infoGrid, 'Battery Charging', batteryCharging, `Charging status: ${batteryCharging}`); // Separate detail too
            });
        } else {
            createInfoItem(infoGrid, 'Battery Info', 'Battery API not supported', 'Battery API is not supported by this browser.');
        }

        // 7. Screen Information
        createInfoItem(infoGrid, 'Screen Width', screen.width + 'px', `Screen width in pixels: ${screen.width}px`);
        createInfoItem(infoGrid, 'Screen Height', screen.height + 'px', `Screen height in pixels: ${screen.height}px`);
        createInfoItem(infoGrid, 'Screen Color Depth', screen.colorDepth + ' bits', `Color depth: ${screen.colorDepth} bits`);
        createInfoItem(infoGrid, 'Screen Orientation', screen.orientation.type, `Screen orientation: ${screen.orientation.type}`);

        // 8. Network Information (navigator.connection API - LIMITED INFO)
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const effectiveConnectionType = connection.effectiveType || 'Unknown'; // Get effectiveType
            const connectionType = connection.type || 'Unknown'; // Get connection type (cellular, wifi, etc.)

            // Conditionally create "Connection Type (Browser Reported)" item only if it's 4g or faster (or similar strings)
            if (effectiveConnectionType === '4g' || effectiveConnectionType === '5g' || effectiveConnectionType === 'slow-4g' || effectiveConnectionType === 'fast-4g') { // Add other 4G/5G related strings if needed
                let displayConnectionType = effectiveConnectionType.startsWith('5g') ? '5G' : '4G'; // Default to "4G" or "5G"
                let detailText = `Browser reported connection quality: ${effectiveConnectionType}. (Estimate only).`;

                if (connectionType === 'cellular') { // If it's a cellular connection, try to guess LTE/NR
                    if (effectiveConnectionType.startsWith('5g')) {
                        displayConnectionType = '5G NR (Assumed)'; // Assume 5G NR for cellular 5G
                        detailText = `Assumed 5G NR based on browser reported connection quality: ${effectiveConnectionType} and cellular connection type. (Very unreliable assumption).`;
                    } else if (effectiveConnectionType === '4g') {
                        displayConnectionType = '4G LTE (Assumed)'; // Assume 4G LTE for cellular 4G
                        detailText = `Assumed 4G LTE based on browser reported connection quality: ${effectiveConnectionType} and cellular connection type. (Unreliable assumption).`;
                    }
                }
                createInfoItem(infoGrid, 'Connection Type (Browser Reported)', displayConnectionType, detailText); // Updated label and detail
            }
            // If effectiveConnectionType is 3g, 2g, slow-2g, or unknown, we simply don't create the info item, effectively removing it from the UI.

            createInfoItem(infoGrid, 'Downlink Speed (Estimate)', connection.downlink ? `${connection.downlink} Mbps` : 'Unknown', `Estimated downlink speed: ${connection.downlink ? `${connection.downlink} Mbps` : 'Unknown'}. (Very approximate, not a speed test)`);
            createInfoItem(infoGrid, 'Round-Trip Time (RTT)', connection.rtt ? `${connection.rtt} ms` : 'Unknown', `Estimated Round-Trip Time (latency): ${connection.rtt ? `${connection.rtt} ms` : 'Unknown'}.`);
            createInfoItem(infoGrid, 'Connection Type', connectionType, `Connection type: ${connectionType} (e.g., cellular, wifi, ethernet).`); // Keep this "Connection Type" (wifi/cellular/etc.)
        } else {
            createInfoItem(infoGrid, 'Network Info', 'Not Supported', 'navigator.connection API is not supported by this browser.');
        }

    }, 500);
});


function createInfoItem(gridElement, label, value, detailText) { // detailText parameter added
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('info-item');
    itemDiv.innerHTML = `
        <strong>${label}</strong>
        <p class="main-info">${value}</p>
        <div class="details">
            <p>${detailText}</p>
        </div>
    `;

    itemDiv.addEventListener('click', function() {
        this.classList.toggle('expanded'); // Toggle 'expanded' class on click
    });

    gridElement.appendChild(itemDiv);
}


function parseOSFromUserAgent(userAgent) {
    const userAgentLower = userAgent.toLowerCase();

    if (userAgentLower.includes('android')) {
        let androidVersion = 'Unknown Android Version';
        const androidMatch = userAgentLower.match(/android\s([0-9\.]+)/);
        if (androidMatch && androidMatch[1]) {
            androidVersion = 'Android ' + androidMatch[1];
        }
        return androidVersion;
    } else if (userAgentLower.includes('ios') || userAgentLower.includes('iphone') || userAgentLower.includes('ipad')) {
        let iOSVersion = 'Unknown iOS Version';
        const iOSMatch = userAgentLower.match(/os\s([0-9_]+)/);
        if (iOSMatch && iOSMatch[1]) {
            iOSVersion = 'iOS ' + iOSMatch[1].replace(/_/g, '.');
        }
        return iOSVersion;
    } else if (userAgentLower.includes('windows')) {
        return 'Windows';
    } else if (userAgentLower.includes('mac')) {
        return 'macOS';
    } else if (userAgentLower.includes('linux')) {
        return 'Linux';
    } else {
        return 'Unknown Operating System';
    }
} 