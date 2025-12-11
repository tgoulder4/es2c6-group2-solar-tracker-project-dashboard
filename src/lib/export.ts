import { mkConfig, generateCsv, download } from "export-to-csv";
// mkConfig merges your options with the defaults
// and returns WithDefaults<ConfigOptions>
const csvConfig = mkConfig({ useKeysAsHeaders: true });

const mockData = [
    {
        name: "Rouky",
        date: "2023-09-01",
        percentage: 0.4,
        quoted: '"Pickles"',
    },
    {
        name: "Keiko",
        date: "2023-09-01",
        percentage: 0.9,
        quoted: '"Cactus"',
    },
];

// Converts your Array<Object> to a CsvOutput string based on the configs
const csv = generateCsv(csvConfig)(mockData);

// Get the button in your HTML
const csvBtn = document.querySelector("#csv");

// Add a click handler that will run the `download` function.
// `download` takes `csvConfig` and the generated `CsvOutput`
// from `generateCsv`.
export const ;
if (csvBtn) csvBtn.addEventListener("click", () => download(csvConfig)(csv));
