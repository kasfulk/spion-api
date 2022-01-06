import authService from "./auth.service.js";

const indexPage = (req, res) => {
    res.send({
      message: 'berhasil',
    });
  };

const login = (req, res) => {
    authService.login( req, res);
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

const getUser = (req, res) => {
    authService.getUser(req, res);
};

export default { 
    indexPage,
    login,
    checkPayload,
    getUser,
};