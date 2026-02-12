import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configurePassport = () => {
    // Only configure Google OAuth if credentials are provided
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

    if (clientID && clientSecret && clientID !== 'your-google-client-id') {
        passport.use(
            new GoogleStrategy(
                {
                    clientID,
                    clientSecret,
                    callbackURL,
                    scope: ['profile', 'email'],
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        // Check if user exists with this Google ID
                        let user = await User.findOne({ googleId: profile.id });

                        if (user) {
                            // Update last login
                            user.lastLogin = new Date();
                            user.loginCount += 1;
                            await user.save();
                            return done(null, user);
                        }

                        // Check if user exists with this email
                        const email = profile.emails?.[0]?.value;
                        if (email) {
                            user = await User.findOne({ email });
                            if (user) {
                                // Link Google account to existing user
                                user.googleId = profile.id;
                                user.isVerified = true;
                                if (!user.profilePicture && profile.photos?.[0]?.value) {
                                    user.profilePicture = profile.photos[0].value;
                                }
                                user.lastLogin = new Date();
                                user.loginCount += 1;
                                await user.save();
                                return done(null, user);
                            }
                        }

                        // Create new user from Google profile
                        const newUser = await User.create({
                            googleId: profile.id,
                            firstName: profile.name?.givenName || 'User',
                            lastName: profile.name?.familyName || '',
                            email: email || `google_${profile.id}@placeholder.com`,
                            profilePicture: profile.photos?.[0]?.value || '',
                            isVerified: true,
                            role: 'user',
                        });

                        return done(null, newUser);
                    } catch (error) {
                        return done(error, null);
                    }
                }
            )
        );

        console.log('✅ Google OAuth strategy configured');
    } else {
        console.log('⚠️ Google OAuth not configured (missing GOOGLE_CLIENT_ID/SECRET)');
    }

    // Serialize/deserialize user
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

export default configurePassport;
