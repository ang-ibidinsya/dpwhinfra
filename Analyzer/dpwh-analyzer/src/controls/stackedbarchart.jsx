import './stackedbarchart.css';


export const mapColors = {
    2016: 'magenta',
    2017: '#F39C12', //Orange
    2018: '#2C3E50', //Dark Blue
    2019: '#2ECC71', //Green
    2020: '#3498DB', //Blue
    2021: '#E74C3C', //Red
    2022: '#1ABC9C', //Teal
    2023: '#F1C40F', //Yellow
    2024: '#9B59B6', //Purple
}

export const StackedBarChart = ({name, subtotalsMap, minCost, maxCost}) => {
    minCost /= 4; // Adjust min so that the smallest item wont be 0
    let stacks = [];
    let sumCosts = Object.values(subtotalsMap).reduce((sum, a) => sum + a, 0);
    let minMaxDiff = maxCost - minCost;
    for (var year in subtotalsMap) {
        if (!Object.prototype.hasOwnProperty.call(subtotalsMap, year)) {
            continue;
        }
        let currCost = subtotalsMap[year];
        // [a] For chart
        let percentFill = (sumCosts-minCost)/minMaxDiff * currCost/sumCosts * 100.0;
        stacks.push(<div className="bar" key={`stack-region-${name}-${year}`} style={{flexBasis: `${percentFill}%`, backgroundColor: `${mapColors[year]}`}}/>);
    }
    
    let remaining = (maxCost-sumCosts) / minMaxDiff * 100.00;
    stacks.push(<div className="barEmpty" key={`stack-region-${name}-${remaining}`} style={{flexBasis: `${remaining}%`}}/>);
        
    return <div className="stackedBarChart"
        >
            {stacks}
        </div>
}

