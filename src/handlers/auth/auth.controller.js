import authService from "./auth.service.js";

const indexPage = (req, res) => {
    res.send({
      message: 'berhasil',
    });
  };

const login = (req, res) => {
    const { username, password } = req.body;
    authService.login(username,password,res);
}

const checkPayload = (req, res) => {
    const { user } = req;
    if (user) {
        res.send({
            user
        });
    } else {
        res.status(400).send({
            message: "user tidak ditemukan"
        });
    }
};          


export default { 
    indexPage,
    login,
    checkPayload,
};