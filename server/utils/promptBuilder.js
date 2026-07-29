const buildResumePrompt = (resumeText) =>{
    return`
    You are an ATS(Application Tracking System) and resume analysis expert.

    Analyze the following resume carefully and return only valid JSON.

    Do not include markdown.

    Do not wrap the response indide
    \`\`\`.

    Return exactly this structure:

    {
        "atsScore" : number,
        "skills: : [],
        "missingSkills: [],
        "strengths" : [],
        "weaknesses" : [],
        "suggestions" : []
    }
    
    Rules:

    1. atsScore should be between 1 to 100.
    
    2. skills should contain technical skills found in the resume.

    3. missingSkills should contain important industry skills that are absent.

    4. strengths should highlight candidate's best qualities.

    5. weaknesses should identify areas that can be improved.

    6. suggestions should provide actionable recommendations.

    Resume:
    ${resumeText}
    `
}

module.exports = buildResumePrompt;

