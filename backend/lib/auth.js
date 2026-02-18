const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const config = require("../config");
const CustomError = require("./Error"); 
const Enums = require("../config/Enums"); 

// Modeller
const RolePrivileges = require("../db/models/RolePrivileges");

module.exports = function () {
    let strategy = new Strategy(
        {
            secretOrKey: config.JWT.SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        async (payload, done) => {
            try {
                // VERİTABANI SORGUSU YOK (STATELESS)
                // Token geçerliyse, içindeki veriyi user objesi kabul ediyoruz.
                // Bu sayede her requestte Users tablosuna gitmekten kurtulduk.
                
                const user = {
                    id: payload.id,
                    email: payload.email,
                    roles: payload.roles // Token içindeki rol ID dizisi
                };

                return done(null, user);
                
            } catch (err) {
                return done(err, false);
            }
        }
    );

    passport.use(strategy);

    return {
        initialize: function () {
            return passport.initialize();
        },
        authenticate: function () {
            return passport.authenticate("jwt", { session: false });
        },
        checkPrivileges: (expectedPrivilege) => {
            return async (req, res, next) => { // async ekledik çünkü DB sorgusu yapacağız
                try {
                    // Kullanıcının rolleri token'dan geldi mi?
                    if (!req.user || !req.user.roles || req.user.roles.length === 0) {
                        return next(new CustomError(Enums.HTTP_CODES.FORBIDDEN, "Privilege Error", "You do not have any roles assigned."));
                    }

                    // Sadece istenen yetki için veritabanına hafif bir sorgu atıyoruz
                    // "Kullanıcının sahip olduğu Rol ID'lerinden (roles array) herhangi birinde,
                    // beklenen yetki (permission) var mı?"
                    const hasPrivilege = await RolePrivileges.findOne({ 
                        role_id: { $in: req.user.roles }, 
                        permission: expectedPrivilege 
                    });

                    if (hasPrivilege) {
                        next();
                    } else {
                        throw new CustomError(Enums.HTTP_CODES.FORBIDDEN, "Privilege Error", "You do not have permission to perform this action.");
                    }
                } catch (err) {
                     next(err);
                }
            }
        }
    };
};