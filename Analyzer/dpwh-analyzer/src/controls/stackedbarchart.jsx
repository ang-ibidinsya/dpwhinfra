import './stackedbarchart.css';

/*
const colors = [
    'cyan',
    '#F39C12', //Orange
    '#2c456b', //Dark Blue
    '#2ECC71', //Green
    '#3498DB', //Blue
    '#E74C3C', //Red
    '#1ABC9C', //Teal
    '#F1C40F', //Yellow
    '#9B59B6', //Purple
]
*/

const colors = [
    'cyan',
    '#F39C12', //Orange
    '#2c456b', //Dark Blue
    '#5d6532', //Green
    '#E74C3C', //Red
    '#3498DB', //Blue
    '#1ABC9C', //Teal
    '#F1C40F', //Yellow
    '#9B59B6', //Purple
    '#6B3A2C', // Coffee
]

export const mapYearColors = {
    2016: 'cyan',
    2017: '#F39C12', //Orange
    2018: '#2c456b', //Dark Blue
    2019: '#5d6532', //Green
    2020: '#E74C3C', //Red
    2021: '#3498DB', //Blue
    2022: '#1ABC9C', //Teal
    2023: '#F1C40F', //Yellow
    2024: '#9B59B6', //Purple
    2025: '#6B3A2C', //Coffee
}

// Hardcode for now
export const mapStatusColors = {
    0: {statusName: 'Completed', color: 'green'},
    1: {statusName: 'Ongoing', color: 'gold'}, // Terminated
    2: {statusName: 'Not Yet Started', color: 'lightgray'}, // Not Yet Started
    3: {statusName: 'Terminated', color: 'red'}, // Ongoing
}

export const getCategoryColor = (cat) => {
    return colors[cat % colors.length];
}

export const getStatusColor = (status) => {
    return mapStatusColors[status].color;
}

export const StackedBarChart = ({name, subtotalsMap, minCost, maxCost, dataType, stretchToFullWidth}) => {
    minCost /= 4; // Adjust min so that the smallest item wont be 0
    let stacks = [];
    let sumCosts = Object.values(subtotalsMap).reduce((sum, a) => sum + a, 0);
    let minMaxDiff = maxCost - minCost;
    for (var key in subtotalsMap) {
        if (!Object.prototype.hasOwnProperty.call(subtotalsMap, key)) {
            continue;
        }
        let color = null;
        if (dataType === 'category') {
            color = getCategoryColor(key);
        }
        else if (dataType === 'status') {
            color = getStatusColor(key);
        }
        else {
            color = mapYearColors[key];
        }
        let currCost = subtotalsMap[key];
        // [a] For chart
        let percentFill = 0;
        if (stretchToFullWidth) {
            percentFill = currCost/sumCosts * 100.0;
        }
        else
        {
            percentFill = (sumCosts-minCost)/minMaxDiff * currCost/sumCosts * 100.0;
        }
        stacks.push(<div className="bar" key={`stack-region-${name}-${key}`} style={{flexBasis: `${percentFill}%`, backgroundColor: `${color}`}}/>);
    }
    
    let remaining = stretchToFullWidth ? 0: (maxCost-sumCosts) / minMaxDiff * 100.00;
    stacks.push(<div className="barEmpty" key={`stack-region-${name}-remaining`} style={{flexBasis: `${remaining}%`}}/>);
        
    return <div className="stackedBarChart"
        >
            {stacks}
        </div>
}

export const StackedBarChart2 = ({name, subtotalsMap, minCost, maxCost}) => {
    return <div className="stackedBarChart"
        >
            {name}
        </div>
}

