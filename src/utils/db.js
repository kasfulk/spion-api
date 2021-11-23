import pool from "../helpers/db.js";

const dbName = process.env.DB_NAME;

const allowedLogical = (string) => {
    const logical = ["AND","OR"];
    if (logical.includes(string)) {
        return string;
    }
}

const checkTable = async (table, data) => {
    const keyList = Object.keys(data);

    // filtering field
    const [fieldRawList] = await pool.query(`SELECT COLUMN_NAME FROM information_schema.COLUMNS
                                        WHERE
                                        TABLE_SCHEMA = '${dbName}' AND
                                        TABLE_NAME = '${table}' AND
                                        COLUMN_NAME IN ('${keyList.join(`','`)}')`);

    const fieldList = fieldRawList.map(field => field.COLUMN_NAME);
    const setData = [];
    const preparedList = [];

    for (const key of fieldList) {

        setData.push(`${key} = ?`);
        preparedList.push(data[key]);
    }

    return {
        fieldList,
        setData,
        preparedList,
    }
}

// Options:
// Logical Options: AND, OR
// Where: auto dinamically with object as field and value as search value
//
export const dbUpdate = async (table, data, options) => {
    const { setData, preparedList } = await checkTable(table, data);
    const {logic, wheres} = options;
    const logicalCondition = logic ? allowedLogical(logic) : "AND";
    const whereList = [];

    for (const key in wheres) {
        whereList.push(`${key} = ?`);
        preparedList.push(wheres[key]);
    }

    // push for where in select
    for (const key in wheres) {
        preparedList.push(wheres[key]);
    }

    const sql = `UPDATE ${table} SET ${setData.join(", ")} WHERE ${whereList.join(` ${logicalCondition} `)};
                 SELECT *  FROM ${table} WHERE ${whereList.join(` ${logicalCondition} `)}`;

    const [result] = await pool.query(sql,preparedList);

    return result;
};

// Options:
// keyField: Primary ID of table
//
export const dbInsert = async (table, data, options) => {
    const { fieldList, preparedList } = await checkTable(table, data);
    const  { keyField } = options;
    const insertList = [];
    const whereKey = data[keyField];

    for (const key of fieldList) {
        insertList.push(`?`);
    }


    // insert mysql query
    const sql = `INSERT INTO ${table} (${fieldList.join(", ")}) VALUES (${insertList.join(", ")});
                SELECT * FROM ${table} WHERE ${keyField}='${whereKey}';`;
    console.log(sql);

    const [result] = await pool.query(sql,preparedList);

    return result;
}
