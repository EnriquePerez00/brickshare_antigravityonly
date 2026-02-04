
// Using the key commonly found in older files or snippets if available
// If check_age.ts exists, I'd grab it from there. 
// For now, I'll try the same key but with the correct URL structure.
const BRICKSET_API_KEY = "3630-9854-9541";
const setNum = "75078-1";

async function checkDescription() {
    console.log(`Fetching data for set ${setNum}...`);
    // Added .asmx to path
    const url = `https://brickset.com/api/v3.asmx/getSets?apiKey=${BRICKSET_API_KEY}&userHash=&params=${JSON.stringify({ setNumber: setNum })}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log("Status:", res.status, res.statusText);
            const text = await res.text();
            console.log("Response Text Preview:", text.substring(0, 200));
            return;
        }
        const data = await res.json();
        if (data.status === 'success' && data.sets.length > 0) {
            const set = data.sets[0];
            console.log("Extended Data:", JSON.stringify(set.extendedData, null, 2));
            console.log("Description:", set.extendedData?.description);
        } else {
            console.log("Set not found or error", data);
        }
    } catch (e) {
        console.error(e);
    }
}

checkDescription();
