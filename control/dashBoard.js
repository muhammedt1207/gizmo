const Order=require("../models/orders")
const moment=require("moment")
const pdf=require('../util/pdfGenarater')

const salesReport=async(req,res)=>{
    try {
      const orders = await Order.find({
        Status: {
          $nin: ["returned", "Cancelled", "Rejected"]
        }
      }).populate({
        path: 'Items.productId',
        model: 'productUpload',
        select: 'Category',
      });
  
      const orderCountsByDay = {};
      const totalAmountByDay = {};
      const orderCountsByMonthYear = {};
      const totalAmountByMonthYear = {};
      const orderCountsByYear = {};
      const totalAmountByYear = {};
      const orderCountsByCategory = {};
      let labelsByCount;
      let labelsByAmount;
      let labelsByCategory;

      orders.forEach((order) => {
  
        const orderDate = moment(order.OrderDate, "M/D/YYYY, h:mm:ss A");
        const dayMonthYear = orderDate.format("YYYY-MM-DD");
        const monthYear = orderDate.format("YYYY-MM");
        const year = orderDate.format("YYYY");
        
        if (req.url === "/count-orders-by-day") {
         
          if (!orderCountsByDay[dayMonthYear]) {
            orderCountsByDay[dayMonthYear] = 1;
            totalAmountByDay[dayMonthYear] = order.TotalPrice
           
           
          } else {
            orderCountsByDay[dayMonthYear]++;
            totalAmountByDay[dayMonthYear] += order.TotalPrice
          }
  
          const ordersByDay = Object.keys(orderCountsByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              count: orderCountsByDay[dayMonthYear],
            })
          );
       
  
          const amountsByDay = Object.keys(totalAmountByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              total: totalAmountByDay[dayMonthYear],
            })
          );
  
          
  
          amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
          ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
  
         
  
          labelsByCount = ordersByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
  
          labelsByAmount = amountsByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
  
          dataByCount = ordersByDay.map((entry) => entry.count);
          dataByAmount = amountsByDay.map((entry) => entry.total);
  
          order.Items.forEach((product) => {
          const category = product.productId.Category;

          if (!orderCountsByCategory[category]) {
            orderCountsByCategory[category] = 1;
          } else {
            orderCountsByCategory[category]++;
          }
        });
  
        } else if (req.url === "/count-orders-by-month") {
          if (!orderCountsByMonthYear[monthYear]) {
            orderCountsByMonthYear[monthYear] = 1;
            totalAmountByMonthYear[monthYear] = order.TotalPrice;
          } else {
            orderCountsByMonthYear[monthYear]++;
            totalAmountByMonthYear[monthYear] += order.TotalPrice;
          }
        
          const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              count: orderCountsByMonthYear[monthYear],
            })
          );
          const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              total: totalAmountByMonthYear[monthYear],
            })
          );
         
        
          ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          labelsByAmount = amountsByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          dataByCount = ordersByMonth.map((entry) => entry.count);
          dataByAmount = amountsByMonth.map((entry) => entry.total);
          order.Items.forEach((product) => {
            const category = product.productId.Category;
  
            if (!orderCountsByCategory[category]) {
              orderCountsByCategory[category] = 1;
            } else {
              orderCountsByCategory[category]++;
            }
          });
        } else if (req.url === "/count-orders-by-year") {
          // Count orders by year
          if (!orderCountsByYear[year]) {
            orderCountsByYear[year] = 1;
            totalAmountByYear[year] = order.TotalPrice;
          } else {
            orderCountsByYear[year]++;
            totalAmountByYear[year] += order.TotalPrice;
          }
        
          const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
            _id: year,
            count: orderCountsByYear[year],
          }));
          const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
            _id: year,
            total: totalAmountByYear[year],
          }));
        
          ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByYear.map((entry) => entry._id);
          labelsByAmount = amountsByYear.map((entry) => entry._id);
          dataByCount = ordersByYear.map((entry) => entry.count);
          dataByAmount = amountsByYear.map((entry) => entry.total);
          order.Items.forEach((product) => {
            const category = product.productId.Category;
  
            if (!orderCountsByCategory[category]) {
              orderCountsByCategory[category] = 1;
            } else {
              orderCountsByCategory[category]++;
            }
          });
        }
      });
      const ordersByCategory = Object.keys(orderCountsByCategory).map((category) => ({
        _id: category,
        count: orderCountsByCategory[category],
      }));
      ordersByCategory.sort((a, b) => (a.count < b.count ? 1 : -1));

      // Set labels and data for category chart
      labelsByCategory = ordersByCategory.map((entry) => entry._id);
      const dataByCategory = ordersByCategory.map((entry) => entry.count);
    
     
      res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount, dataByCategory,labelsByCategory  });
      
  
    } catch (error) {
      res.render('admin/404')
      console.error("error while chart loading :",error)
    }
  }
  
  


const getOrdersAndSellers=async(req,res)=>{
    try {
      const bestSeller = await Order.aggregate([
        {
          $unwind: "$Items",
        },
        {
          $group: {
            _id: "$Items.productId",
            totalCount: { $sum: "$Items.quantity" },
          },
        },
        {
          $sort: {
            totalCount: -1,
          },
        },
        {
          $limit: 5,
        },
        {
          $lookup: {
            from: "productuploads",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
      ]);
      
      if (!bestSeller) throw new Error("No Data Found");
     
      res.json({  bestSeller });
    
    
     
    } catch (error) {
      
    }
    }
    
    const genereatesalesReport = async (req, res) => {
      try {

        const startDate = req.body.startDate;
        const format = req.body.downloadFormat;
        const endDate = new Date(req.body.endDate);
        endDate.setHours(23, 59, 59, 999);
    
        const orders = await Order.find({
          Status: {
            $nin: ["returned", "Cancelled", "Rejected"]
          },
          paymentStatus: { $in: ["Paid", "Pending"] },
          OrderDate: {
            $gte: startDate,
            $lte: endDate,
          },
        }).populate("Items.productId");
        
    
        let totalSales = 0;
    
        orders.forEach((order) => {
          totalSales += order.TotalPrice || 0;
        });
        
    
        pdf.downloadReport(
          req,
          res,
          orders,
          startDate,
          endDate,
          totalSales.toFixed(2),
          format
        );
      } catch (error) {
        res.render('admin/404')
        res.status(500).send("Internal Server Error");
      }
    };

    module.exports={
        getOrdersAndSellers,
        salesReport,
        genereatesalesReport
    }