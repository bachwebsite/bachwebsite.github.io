function addWidgetBotScript() {
    // Create a script element
        var script = document.createElement('script');
    
    // Set the source attribute to the WidgetBot script
        script.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3';
        script.async = true;
        script.defer = true;
    
    // Set the content of the script
        script.innerHTML = `
            new Crate({
                server: '1104851833383571478', // Breadside
                channel: '1144877440053821460' // #🤓pov-ur-in-class
            });
        `;
    
    // Append the script to the body of the document
        document.body.appendChild(script);
    }
    