const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const config = require("../config");
const CustomError = require("./Error"); 
const Enums = require("../config/Enums"); 

// Modeller
const Users = require("../db/Models/Users");
const UserRoles = require("../db/models/UserRoles");
const RolePrivileges = require("../db/models/RolePrivileges");

module.exports = function () {
    let strategy = new Strategy(
        {
            secretOrKey: config.JWT.SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        async (payload, done) => {
            try {
                let user = await Users.findOne({ _id: payload.id });

                if (user) {
                    if (!user.is_active) {
                        return done(null, false, { message: "User is not active." });
                    }

                    // Kullanıcının rollerini ve yetkilerini çekiyoruz
                    let userRoles = await UserRoles.find({ user_id: payload.id });
                    let roleIds = userRoles.map(ur => ur.role_id);
                    let rolePrivileges = await RolePrivileges.find({ role_id: { $in: roleIds } });
                    
                    // Yetkileri (permission stringlerini) bir diziye dönüştür
                    let privileges = rolePrivileges.map(rp => rp.permission);

                    return done(null, {
                        id: user._id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        roles: roleIds,
                        privileges: privileges // ["category_add", "user_view" vs.]
                    });

                } else {
                    return done(null, false);
                }
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
        // --- YENİ EKLENEN KISIM: Yetki Kontrolü ---
        checkRoles: (...expectedRoles) => {
            return (req, res, next) => {
                // Şimdilik sadece yetki bazlı gidiyoruz ama ilerde rol kontrolü gerekirse burası kullanılabilir.
                // Logic privilege ile aynı mantıkta kurulabilir.
                next();
            }
        },
        checkPrivileges: (expectedPrivilege) => {
            return (req, res, next) => {
                // 1. Kullanıcının yetkileri var mı kontrol et
                if (req.user && req.user.privileges && req.user.privileges.includes(expectedPrivilege)) {
                    // Yetkisi var, geçiş izni ver
                    next();
                } else {
                    // Yetkisi yok, 403 Forbidden fırlat
                    next(new CustomError(Enums.HTTP_CODES.FORBIDDEN, "Privilege Error", "You do not have permission to perform this action."));
                }
            }
        }
    };
};