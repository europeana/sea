import translateWorkers from "./translate/index";
import zohoCRMWorkers from "./zoho/crm/index";

export default [translateWorkers, zohoCRMWorkers].flat();
