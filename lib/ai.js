class PredictSales{
    constructor(days=5, sales=[10, 20, 30, 40, 50]){
        this.input = [];
        for (var i=0; i<days; i++){ this.input.push(i + 1); }
        this.output = sales;
        this.degree = 1;
        this.run();
    }

    run(){
        const PolynomialRegression = require('ml-regression-polynomial');
        this.model = new PolynomialRegression(this.input, this.output, this.degree);
    }

    predict(day){ return Math.round(this.model.predict(day)); }
}

module.exports = PredictSales