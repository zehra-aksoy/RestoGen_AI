const fs = require('fs');

async function checkModels() {
    try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (!match || !match[1]) {
            console.log("Key bulunamadi.");
            return;
        }
        const key = match[1].trim();

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.filter(m => m.name.includes("gemini")).forEach(m => {
                console.log(m.name, "-", m.supportedGenerationMethods.join(", "));
            });
        } else {
            console.log("Error:", data);
        }
    } catch(e) {
        console.error("Fetch hatasi:", e);
    }
}

checkModels();
