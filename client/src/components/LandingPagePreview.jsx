
// eslint-disable-next-line react/prop-types
const LandingPagePreview = ({ code }) => {
  let previewHTML = '';
  try {
    // eslint-disable-next-line react/prop-types
    let jsonString = code.trim();
    // Use a regex to extract the JSON object in case there’s extra text
    const jsonMatch = jsonString.match(/\{[\s\S]*\}$/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    const projectFiles = JSON.parse(jsonString);
    // Adjust the key based on your generated project structure.
    // Here we expect the main HTML file to be at "client/public/index.html"
    previewHTML = projectFiles['client/public/index.html'] || '<p>No index.html file found.</p>';
  } catch (error) {
    console.error('JSON Parsing Error:', error);
    // If parsing fails, show the raw code for debugging
    previewHTML = `<pre>${code}</pre>`;
  }
  return (
    <div className="border rounded-lg p-4" dangerouslySetInnerHTML={{ __html: previewHTML }} />
  );
};

export default LandingPagePreview;
