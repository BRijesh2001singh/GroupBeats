import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import axios from "axios";
const apiurl=process.env.NEXT_PUBLIC_API_URL;
const handler=NextAuth({
providers:[
    Google({
    clientId:process.env.GOOGLE_AUTH_CLIENT_ID??"",
    clientSecret:process.env.GOOGLE_AUTH_CLIENT_SECRET??"",
    authorization:{
        params:{
            scope:"openid email profile",
        },
    },
    }),
],
callbacks:{
    async jwt({token,account,profile}){
        if(account&&profile){
            try {
               const response=await axios.post(`${apiurl}/api/signup`,{  //create new user in database
                    name:profile.name,
                    email:profile.email
                })
                 token.backendId=response.data.id;
            } catch (error) {
                console.log("Error registering User",error);
            }
        }
        return token;
    },
    async session({session,token}){
        if(session.user){
            session.user.backendId=token.backendId as string|null|undefined;
        }
        return session;
    }
}
})

export {handler as GET,handler as POST}