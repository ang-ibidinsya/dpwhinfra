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