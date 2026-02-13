const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const config = require("../config");
const Users = require("../db/models/Users");

module.exports = function () {
    let strategy = new Strategy(
        {
            secretOrKey: config.JWT.SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        async (payload, done) => {
            try {
                // Token geçerli, içindeki ID ile kullanıcıyı bulalım
                let user = await Users.findOne({ _id: payload.id });

                if (user) {
                    // Kullanıcı aktif mi?
                    if (!user.is_active) {
                        return done(null, false, { message: "User is not active." });
                    }

                    // Kullanıcının rol ve yetkilerini de request'e ekleyelim
                    // Şimdilik sadece user dönüyoruz.
                    return done(null, {
                        id: user._id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        roles: user.roles // Eğer token payload'ına koyduysan veya DB'den çektiysen
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
        }
    };
};