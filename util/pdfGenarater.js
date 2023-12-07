const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const exceljs = require('exceljs');
const dateFormat = require('date-fns/format');


module.exports = {
    downloadReport: async (req, res, orders, startDate, endDate, totalSales, format) => {
      const formattedStartDate = dateFormat(new Date(startDate), 'yyyy-MM-dd');
      const formattedEndDate = dateFormat(new Date(endDate), 'yyyy-MM-dd');
      try {
        const totalAmount = parseInt(totalSales)
        console.log('Total Sales:', totalAmount);
        const template = fs.readFileSync('util/template.ejs', 'utf-8');
        const html = ejs.render(template, { orders, startDate, endDate, totalAmount });
        console.log(typeof(totalAmount));
        if (format === 'pdf') {
          const pdfOptions = {
            format: 'Letter',
            orientation: 'portrait',
          };
  
          const filePath = `public/salesReport/pdf/sales-report-${formattedStartDate}-${formattedEndDate}.pdf`;
          pdf.create(html, pdfOptions).toFile(filePath, (err, response) => {
            if (err) {
              console.error('Error generating PDF:', err);
              res.status(500).send('Internal Server Error');
            } else {
              res.status(200).download(response.filename);
            }
          });
        } else if (format === 'excel') {
          const workbook = new exceljs.Workbook();
          const worksheet = workbook.addWorksheet('Sales Report');
  
          worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 25 },
            { header: 'Product Name', key: 'productName', width: 25 },
            { header: 'User ID', key: 'userId', width: 25},
            { header: 'Date', key: 'date', width: 25 },
            { header: 'Total Amount', key: 'totalamount', width: 25 },
            { header: 'Payment Method', key: 'paymentmethod', width: 25 },
          ];
  
          let totalSalesAmount = 0;
  
          orders.forEach(order => {
          // console.log(orders);
            order.Items.forEach(item => {
              console.log(item,'------------------');
              worksheet.addRow({
                orderId: order._id,
                productName: item.productId.ProductName,
                userId: order.UserID,
                date: order.OrderDate ? new Date(order.OrderDate).toLocaleDateString() : '',
                totalamount: order.TotalPrice !== undefined ? order.TotalPrice.toFixed(2) : '',
                paymentmethod: order.paymentMethod,
              });

             
              totalSalesAmount += order.TotalPrice !== undefined ? order.TotalPrice : 0;
        
            });
          });
  
          
          worksheet.addRow({ totalamount: 'Total Sales Amount', paymentmethod: totalSalesAmount.toFixed(2) });
  
          const excelFilePath = `public/salesReport/excel/sales-report-${formattedStartDate}-${formattedEndDate}.xlsx`;
          await workbook.xlsx.writeFile(excelFilePath);
  
          res.status(200).download(excelFilePath);
        } else {
          res.status(400).send('Invalid download format');
        }
      } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Internal Server Error');
      }
    },
};