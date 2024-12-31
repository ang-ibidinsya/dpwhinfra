import './barchart.css';

export const BarChart = ({cost, minCost, maxCost, adjusterMin, adjusterMax}) => {
    if (!adjusterMin) {
        adjusterMin = 2;
    }
    if (!adjusterMax) {
        adjusterMax = 1;
    }
    minCost /= adjusterMin; // Adjust min so that the smallest item wont be 0
    maxCost /= adjusterMax; // Adjust max because the current max price is way too big compared to the median cost
    let percentFill = (cost - minCost) / (maxCost - minCost) * 100.00;
        
    return <div className="barChart">
        <div className="barFilled" style={{flexBasis: `${percentFill}%`}}/>
        <div className="barEmpty" style={{flexBasis: `${100-percentFill}%`}}/>
    </div>
}

