declare module widget {

    type wcSelect = 'chart' | 'table' | 'map' | String ;

    module widget {
        
        interface WidgetConfig {
            wcType: String;
            wcData: WcDataChart | WcDataTable | WcDataMap;
            wcSelect: wcSelect;
        }
        interface WcDataChart {
            title: String;
            description: String;
            w: String;
            h: String;
            cType: String;
            cConfig: any;
        }
        interface WcDataTable {
            title: String;
            w: String;
            h: String;
            tType: String;
        }
        interface WcDataMap {
            title: String;
            w: String;
            h: String;
            mType: String;
        }
        
    }
    interface Overlay { }
}
export = widget