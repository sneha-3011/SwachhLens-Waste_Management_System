const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const Complaint = require("../models/Complaint");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const analyzeComplaint = async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findByPk(id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        if (!complaint.image) {
            return res.status(400).json({
                message: "Complaint has no image"
            });
        }

        const imagePath = `uploads/${complaint.image}`;

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({
                message: "Complaint image not found"
            });
        }

        const imageBuffer = fs.readFileSync(imagePath);

        const prompt = `
            You are an AI waste management assistant.

            Analyze this waste image and return ONLY valid JSON.

            Classify the waste into ONE of these categories:

            - Overflowing Bin
            - Garbage Dump
            - Plastic Waste
            - Construction Debris
            - Organic Waste
            - E-Waste
            - Hazardous Waste
            - Drain Blockage
            - Mixed Waste
            - Other

            Estimate the visible waste amount as:

            - Small
            - Medium
            - Large
            - Very Large

            Also provide a confidence score between 0 and 1.

            Return exactly:

            {
            "wasteType": "Plastic Waste",
            "wasteSize": "Medium",
            "confidence": 0.85
            }
            `;

        let response;
        for(let attempt=1;attenpt<=3;attempt++){
            try{

                 response = await ai.models.generateContent({
                    model: "gemini-3.6-flash",
                    contents: [
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: imageBuffer.toString("base64")
                            }
                        },
                        {
                            text: prompt
                        }
                    ]
                });
                break;
        }catch(error){
            console.error('Gemini attemp ${attempt} failed:',
                error.status,
                error.message
            );
            if(error.status !== 503 || attempt === 3){
                throw error;
            }
            await new Promise(resolve =>
                setTimeout(resolve, attempt * 2000)
            );
        }
    }


        let resultText = response.text.trim();

        resultText = resultText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const result = JSON.parse(resultText);

        let priority = "Medium";

        if (result.wasteSize === "Small") {
            priority = "Low";
        }

        if (result.wasteSize === "Medium") {
            priority = "Medium";
        }

        if(result.wasteSize === "Large"){
            priority = "High";
        }

        if(result.wasteSize === "Very Large"){
            priority="Critical";
        }
        if (
            result.wasteType === "Hazardous Waste" ||
            result.wasteType === "Drain Blockage"
        ) {
            priority = "High";
        }

        await complaint.update({
            wasteType: result.wasteType,
            wasteSize: result.wasteSize,
            priority,
            aiConfidence: result.confidence
        });

        return res.json({
            message: "AI analysis completed",
            analysis: {
                wasteType: result.wasteType,
                wasteSize: result.wasteSize,
                priority,
                aiConfidence: result.confidence
            }
        });

    } catch (error) {
        console.error("AI Analysis Error:", error);

        res.status(500).json({
            message: "AI analysis failed",
            error: error.message
        });
    }
};

module.exports = { analyzeComplaint };