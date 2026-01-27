# Example Directive: Process Data

## Goal
Process raw data files and transform them into a structured format for analysis.

## Inputs
- Raw data file path (CSV, JSON, or Excel)
- Configuration parameters (optional):
  - Column mappings
  - Validation rules
  - Output format

## Tools/Scripts to Use
- `execution/process_data.py` - Main data processing script

## Process
1. Validate input file exists and is readable
2. Load data using appropriate parser
3. Apply transformations according to configuration
4. Validate output data
5. Save to deliverable location (Google Sheets or specified output)

## Outputs
- Processed data in Google Sheets or specified format
- Processing log with summary statistics
- Error report if any issues encountered

## Edge Cases
- **Missing files**: Check file exists before processing
- **Invalid format**: Validate file format matches expected type
- **Large files**: Consider chunking for files > 100MB
- **API rate limits**: Implement exponential backoff for Google Sheets API

## Notes
- All intermediate files should be stored in `.tmp/`
- Deliverables should be in cloud storage (Google Sheets, etc.)
- Update this directive with any new learnings or edge cases discovered
