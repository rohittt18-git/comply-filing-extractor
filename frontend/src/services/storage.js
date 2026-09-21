const HISTORY_KEY = "comply_extract_history";

export function getExtractionHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to read extraction history:", error);
    return [];
  }
}

export function saveExtractionHistory(result) {
  try {
    const history = getExtractionHistory();

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      filename: result.filename,
      pages: result.pages,
      sections: result.sections || [],
      sectionCount: result.sections?.length || 0,
      extractedAt: new Date().toISOString(),
    };

    const updatedHistory = [record, ...history].slice(0, 20);

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(updatedHistory)
    );

    return record;
  } catch (error) {
    console.error("Failed to save extraction history:", error);
    return null;
  }
}

export function clearExtractionHistory() {
  localStorage.removeItem(HISTORY_KEY);
}