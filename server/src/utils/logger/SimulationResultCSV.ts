import { simulation_result } from "../../core/simulation/SimulationResult_v1";
import path from "path";
import fs from "fs";

export function generate_csv_file(): string {
  const csv_file = `simulation_results_investment.csv`;

  // Create the directory if it doesn't exist

  return csv_file;
}

// AI-generated code
// Generate a CSV file containing investment data from simulation results for each year with numbers formatted to two decimal places
export function generate_investment_csv(
  simulation_result: simulation_result,
  username: string
): string {
  // Create filename with username and current datetime
  const current_datetime = new Date()
    .toISOString()
    .replace(/[:T]/g, "-")
    .slice(0, 19);
  const csv_filename = `${username}_${current_datetime}.csv`;

  // Get project root directory and create logs/csv directory if it doesn't exist
  const project_root = path.join(__dirname, "../../../");
  const csv_dir = path.join(project_root, "logs/csv");

  if (!fs.existsSync(csv_dir)) {
    fs.mkdirSync(csv_dir, { recursive: true });
  }

  const csv_path = path.join(csv_dir, csv_filename);

  // Start building CSV content
  let csv_content = "";

  // Get all unique investment names across all years
  const investment_names = new Set<string>();

  simulation_result.yearly_results.forEach((yearly_result) => {
    yearly_result.all_investment.forEach((investment) => {
      investment_names.add(investment.name);
    });
  });

  // Create header row with year and all investment names
  csv_content += "Year," + Array.from(investment_names).join(",") + "\n";

  // Add data rows for each year
  simulation_result.yearly_results.forEach((yearly_result) => {
    const year = yearly_result.year;
    let row = `${year}`;

    // Create a map of investment name to value for easy lookup
    const investment_map: Record<string, number> = {};
    yearly_result.all_investment.forEach((investment) => {
      investment_map[investment.name] = investment.median; // Using median as the representative value
    });

    // Add value for each investment (or empty if not present in this year)
    // Format all numeric values to two decimal places
    Array.from(investment_names).forEach((investment_name) => {
      if (investment_map[investment_name] !== undefined) {
        // Format number to exactly two decimal places
        const formatted_value = investment_map[investment_name].toFixed(2);
        row += `,${formatted_value}`;
      } else {
        row += ",";
      }
    });

    csv_content += row + "\n";
  });

  // Write CSV file
  fs.writeFileSync(csv_path, csv_content);

  return csv_filename;
}
