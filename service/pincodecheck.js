const IndiaPincodeSearch = require('india-pincode-search');
app.use(bodyParser.json());

const pincodeSearch = new IndiaPincodeSearch();

const pincodeDetails = pincodeSearch.getDetails('110001');

