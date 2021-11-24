import { formatWithOptions } from "date-fns/fp/index.js";
import { id } from "date-fns/locale/index.js";

export const getDay = formatWithOptions({ locale: id }, "EEEE");