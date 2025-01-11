import './controlUtils.css';
import { Tooltip } from "react-tooltip";

export const getCategoryTooltipMessage = () => {
    let ret = {
        title: `⚠️ Experimental Feature Warning`,
        body: "Categories are not provided on the DPWH website and are assigned based on the developer's algorithm/judgment. Misclassified or uncategorized items can be reported to the developer."
    };
    return JSON.stringify(ret);
}

export const getShortCategoryTooltipMessage = () => {
    let ret = {
        title: `⚠️ Experimental Feature`,
        body: ""
    };
    return JSON.stringify(ret);
}

export const createGenericToolTip = (tooltipId) => {
    return <Tooltip
    id={tooltipId}
    opacity={1}
    clickable={true}
    float={true}
    style={{ background: "black", color: "#fff", zIndex: 99999 }}
    render={({ content }) => {        
        let jsonContent = JSON.parse(content);
        if (!jsonContent) {
            console.log('[GenericToolTip] Render -- NULL', content);
            return "NULL";
        }
        let {title, body} = jsonContent;

        return <div className="tooltip-generic-container">
            <div className="tooltip-generic-title">{title}</div>
            <div className="tooltip-generic-body">{body}</div>
        </div>
    }}
      
  />
}