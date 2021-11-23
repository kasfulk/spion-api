import { dbUpdate, dbInsert } from "../../utils/db.js";

const updateBangunan = async (req, res) => {
    const data = {
        latitude: '123',
        longitude: '123',
        id_jalan: '123',
        id_rt: '123',
        nama_area_perumahan: '123',
        nama_nomor_gang: '123',
        nomor_bangunan: '123',
        nomor_bangunan_tambahan: '123',
        foto_depan: '123',
        foto_samping: '123',
    };
    const options = {
        wheres: {
            id_bangunan: '1231231'
        }
    }
    const result = await dbUpdate('bangunan', data, options);
    res.json(result);
}

const insertBangunan = async (req, res) => {
    const data = {
        nomor_id_bangunan1: "123213",
        nomor_id_bangunan2: "inkjn",
        id_bangunan: Math.random().toString(36).substring(7),
        latitude: "123",
        longitude: "123",
        id_jalan: "123",
        id_rt: "123",
        nama_area_perumahan: "123",
        nama_nomor_gang: "123",
        nomor_bangunan: "123",
        nomor_bangunan_tambahan: "123",
        foto_depan: "123",
        foto_samping: "123",
        foto_tampakjalan: "23",
        id_jenis_bangunan: "24",
        bangunan_tidak_berpenghuni: "24",
        keterangan_bangunan: "2314",
        status_verifikasi: "123",
        ket_verifikasi: "awdawd"
    };
    const options = {
        keyField: 'id_bangunan'
    }
    const result = await dbInsert('bangunan', data, options);
    res.json(result);
}

export default {
    updateBangunan,
    insertBangunan,
}