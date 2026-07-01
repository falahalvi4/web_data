/**
 * Service for interacting with the Google Sheets API.
 */

export interface SpreadsheetInfo {
  spreadsheetId: string;
  title: string;
  sheets: { title: string; sheetId: number }[];
}

/**
 * Fetch spreadsheet details to obtain sheet titles
 */
export async function getSpreadsheetInfo(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetInfo> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Sheets API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties.title,
    sheets: data.sheets.map((s: any) => ({
      title: s.properties.title,
      sheetId: s.properties.sheetId,
    })),
  };
}

/**
 * Read values from a spreadsheet range
 */
export async function fetchSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal membaca data dari Google Sheets: ${errText}`);
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Append a row of values to a spreadsheet range
 */
export async function appendSheetRow(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  rowValues: any[]
): Promise<boolean> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal menambahkan baris ke Google Sheets: ${errText}`);
  }

  return true;
}

/**
 * Initialize headers for an empty sheet
 */
export async function initializeSheetWithHeaders(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  headers: string[]
): Promise<boolean> {
  // Check if sheet already has values
  try {
    const currentValues = await fetchSheetValues(accessToken, spreadsheetId, `${sheetName}!A1:Z5`);
    if (currentValues && currentValues.length > 0) {
      // Already has data, do not overwrite headers
      return false;
    }
  } catch (e) {
    // Range might not exist or be invalid, continue to write headers to the sheet
    console.warn('Checking values before header initialization failed, writing headers anyway.', e);
  }

  const range = `${sheetName}!A1`;
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [headers],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal menginisialisasi header Google Sheets: ${errText}`);
  }

  return true;
}
