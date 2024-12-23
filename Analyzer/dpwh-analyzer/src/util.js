import { EntityTypes } from "./enums";

// For dropdown
export const filterOptions = (allOptions, filterStr, maxItems) => {
    let retList = [];
    if (!Array.isArray(allOptions)) {
        return retList;
    }
    for (let i = 0; i < allOptions.length; i++) {
        if (retList.length >= maxItems) {
            break;
        }
        let currOption = allOptions[i];
        if (currOption.label.toLowerCase().includes(filterStr.toLowerCase())) {
            retList.push(currOption);
        }
    }

    return retList;
}

export const formatMoney = (num) => {
    const fix = 2;
    var p = num.toFixed(fix).split(".");
    return p[0].split("").reduceRight(function(acc, num, i, orig) {
        if ("-" === num && 0 === i) {
            return num + acc;
        }
        var pos = orig.length - i - 1
        return  num + (pos && !(pos % 3) ? "," : "") + acc;
    }, "") + (p[1] ? "." + p[1] : "");
}

export const formatNumber = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const getMasterDataValue = (masterData, masterDataType, value) => {
    if (masterDataType === EntityTypes.region) {
        return masterData.RegionMaster[value];
    }
    
    if (masterDataType === EntityTypes.district) {
        let districtOrig = masterData.DistrictMaster[value].replace('District Engineering Office', 'DEO');        
        let indexOfDash = districtOrig.indexOf(' - ');
        if (indexOfDash >= 0) {
            return districtOrig.substring(indexOfDash + 3);
        }
        return districtOrig;
    }

    if (masterDataType === EntityTypes.status) {
        return masterData.StatusMaster[value];
    }

    if (masterDataType === EntityTypes.fundSource) {
        return masterData.SourceMaster[value];
    }

    if (masterDataType === EntityTypes.contractor) {
        return masterData.ContractorMaster[value];
    }

    return value;
}

export const statusColorMap = {
    Completed: '#C2E9BF',
    Terminated: '#fde0e0',
    ['On-Going']: '#fffec8',
    'Not Yet Started': '#eee'
}