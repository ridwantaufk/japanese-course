import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { resources } from '@/lib/resources';

export async function POST(request, { params }) {
  const { resource } = await params;
  const config = resources[resource];

  if (!config) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  try {
    const { data } = await request.json(); // Array of rows
    const results = {
      success: 0,
      skipped: 0,
      failed: 0,
      details: [] // { row: 1, status: 'success'|'skipped'|'error', message: '...' }
    };

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;
      
      try {
        // 1. Validate Required Fields
        const missingFields = config.fields
          .filter(f => f.required && (row[f.key] === undefined || row[f.key] === '' || row[f.key] === null))
          .map(f => f.label);

        if (missingFields.length > 0) {
          results.failed++;
          results.details.push({ 
            row: rowNum, 
            status: 'error', 
            message: `Missing required fields: ${missingFields.join(', ')}`,
            data: row
          });
          continue;
        }

        // 2. Check Duplicates (if uniqueKey is defined)
        if (config.uniqueKey && row[config.uniqueKey]) {
          const uniqueVal = row[config.uniqueKey];
          const checkRes = await query(
            `SELECT 1 FROM ${config.table} WHERE ${config.uniqueKey} = $1 LIMIT 1`, 
            [uniqueVal]
          );
          
          if (checkRes.rowCount > 0) {
            results.skipped++;
            results.details.push({ 
              row: rowNum, 
              status: 'skipped', 
              message: `Duplicate ${config.uniqueKey}: "${uniqueVal}"`,
              data: row
            });
            continue;
          }
        }

        // 3. Prepare Insert
        const keys = [];
        const values = [];
        const placeholders = [];
        
        config.fields.forEach(field => {
          if (row[field.key] !== undefined) {
            keys.push(field.key);
            
            // Handle specific types
            let val = row[field.key];
            if (field.type === 'json' && typeof val !== 'object') {
               try { val = JSON.parse(val); } catch(e) { val = {}; }
            }
            if (field.type === 'boolean') {
               val = String(val).toLowerCase() === 'true' || val === true || val === 1;
            }
            
            values.push(val);
            placeholders.push(`$${keys.length}`);
          }
        });

        // 4. Execute Insert
        const insertQuery = `INSERT INTO ${config.table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`;
        await query(insertQuery, values);

        results.success++;
        results.details.push({ 
          row: rowNum, 
          status: 'success', 
          message: 'Imported successfully',
          data: row // Optional: exclude data to save bandwidth if list is huge
        });

      } catch (err) {
        console.error(`Row ${rowNum} error:`, err);
        results.failed++;
        results.details.push({ 
          row: rowNum, 
          status: 'error', 
          message: err.message || 'Database error',
          data: row
        });
      }
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('Import API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}