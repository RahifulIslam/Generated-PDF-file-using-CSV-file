const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const puppeteer = require('puppeteer');

try {
  const filePath1 = 'input.csv';
  const filePath2 = 'input2.csv';
  const fileContentForTable = fs.readFileSync(filePath1, 'utf8');
  const fileContentForGraph = fs.readFileSync(filePath2, 'utf8');

  const tableData = fileContentForTable.split('\n');

  const firstRow = tableData[0];
  const secondRow = tableData[1];
  const thirdRow = tableData[2];
  const forthRow = tableData[3];

let tableHTML = '<table style="border-collapse: collapse; border: 1px solid black;">';
tableData.forEach((row, rowIndex) => {
  const columns = row.split(',');
  
  tableHTML += '<tr>';
  if (rowIndex === 0) {
   const firstRowColumns = firstRow.split(','); 
    tableHTML += `<td style="border: 1px solid black; text-align: center;" colspan="4">${firstRowColumns[0]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center" colspan="4">${firstRowColumns[4]}</td>`;

  } 
  else if(rowIndex===1){
    const secondRowColumns = secondRow.split(',');
    tableHTML += `<td style="border: 1px solid black; text-align: center; background:#90EE90;" colspan="8">${secondRowColumns[0]}</td>`;
  } 
  else if(rowIndex===2){
    const thirdRowColumns = thirdRow.split(',');
    tableHTML += `<td style="border: 1px solid black; text-align: center;">${thirdRowColumns[0]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center;" colspan="2">${thirdRowColumns[1]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center; background-color:#808080;" colspan="3">${thirdRowColumns[3]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center;">${thirdRowColumns[6]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center;">${thirdRowColumns[7]}</td>`;
  }
  else if(rowIndex===3){
    const forthRowColumns = forthRow.split(',');
    tableHTML += `<td style="border: 1px solid black; text-align: center;">${forthRowColumns[0]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center;">${forthRowColumns[1]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center;">${forthRowColumns[2]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center;" colspan="2">${forthRowColumns[3]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center;">${forthRowColumns[5]}</td>`;
    tableHTML += `<td style="border: 1px solid black; text-align: center;" colspan="2">${forthRowColumns[6]}</td>`;
  }
  else {
    columns.forEach((column) => {
      tableHTML += `<td style="border: 1px solid black; text-align: center;">${column}</td>`;
    });
  }
  tableHTML += '</tr>';
});
tableHTML += '</table>';

//For generateing graph
const dataLines = fileContentForGraph.trim().split('\n');
const labels = dataLines[0].split(',').map(label => label.trim());
const datasets = [];
for (let i = 1; i < dataLines.length; i++) {
  const values = dataLines[i].split(',').map(value => parseInt(value.trim(), 10));
  datasets.push(values);
}

// Transpose the datasets to represent each column as a line
const transposedDatasets = labels.map((label, index) => ({
  label: label,
  data: datasets.map(data => data[index]),
  borderColor: getRandomColor(),
  fill: false,
  borderWidth: 2,
  pointRadius: 0,
  tension: 0.1,
}));

// Create a chart using ChartJSNodeCanvas
const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
const configuration = {
  type: 'line',
  data: {
    labels: datasets.map((_, index) => `Dataset ${index + 1}`),
    datasets: transposedDatasets,
  },
  options: {
    responsive: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};

  // Generate PDF using puppeteer for the table
  (async () => {

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync('multiline_chart.png', imageBuffer);
  console.log('Chart saved as multiline_chart.png');

  // Convert the chart image to a Data URL
const chartImageDataURL = `data:image/png;base64,${imageBuffer.toString('base64')}`;

// Create the HTML table with the embedded chart image
const graphHtml = `
  <table>
    <tr>
      <td>
        <img src="${chartImageDataURL}" alt="Chart" style="max-width: 100%; height: auto;">
      </td>
    </tr>
    <!-- Add your table content here -->
  </table>
`;


    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // const combinedHTML = `<div>${tableHTML}${graphHtml}</div>`;
    const combinedHTML = `
    <div style="margin: 20px;">
      <div style="border: 1px solid #ccc; padding: 10px; background-color: #f5f5f5;">
        ${tableHTML}
      </div>
      <div style="border: 1px solid #ccc; padding: 10px; background-color: #f5f5f5;">
      ${graphHtml}
      </div>
    </div>
  `;
    await page.setContent(combinedHTML);
    await page.pdf({ path: 'table_output.pdf', format: 'A4' });
    await browser.close();
    console.log('Table PDF saved as table_output.pdf');
  })();

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

} catch (err) {
  console.error('Error reading the CSV file:', err);
}
