import './barchart.css';

export const BarChart = ({cost, minCost, maxCost}) => {
    minCost /= 4; // Adjust min so that the smallest item wont be 0
    let percentFill = (cost - minCost) / (maxCost - minCost) * 100.00;
        
    return <div className="barChart">
        <div className="barFilled" style={{flexBasis: `${percentFill}%`}}/>
        <div className="barEmpty" style={{flexBasis: `${100-percentFill}%`}}/>
    </div>
}

