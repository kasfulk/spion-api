export const tokenCheck = (req,res,next) => {
    if(req.user){
        next();
    } else {
        res.status(401).send({
            message: "No Auth token",
        });
    }
}