import { isEmpty, validate } from 'class-validator';
import { Router, Request, Response } from "express"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { User } from '../entities/User';
import { mapError } from '../utils/helpers';
import userMiddleware from '../middlewares/user';
import authMiddleware from '../middlewares/auth';

const me = async (_: Request, res: Response) => {
    return res.json(res.locals.user)
}

const register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    try {
        let errors: any = {}

        // 이메일과 유저이름이 이미 저장(사용)되고 있는 것인지 확인
        const emailUser = await User.findOneBy({ email })
        const usernameUser = await User.findOneBy({ username })

        // 이미 있다면 errors 객체에 넣어줌
        if (emailUser) errors.email = "이미 해당 이메일 주소가 사용되었습니다."
        if (usernameUser) errors.username = "이미 이 사용자 이름이 사용되었습니다."

        // 에러가 있다면 return 으로 에러를 response 보내줌
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors)
        }

        // 유저 정보와 함께 user 인스턴스 생성
        const user = new User()
        user.email = email
        user.username = username 
        user.password = password 

        // 엔티티에 정해 놓은 조건으로 user 데이터의 유효성 검사
        errors = await validate(user)

        if (errors.lengh > 0) 
            return res.status(400).json(mapError(errors))

        // 유저 정보를 user table 에 저장
        await user.save()

        return res.json(user)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error })
    }
}

const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        let errors: any = {};

        // 값이 비워져 있다면 에러를 프론트엔드로 전송
        if (isEmpty(username)) errors.username = "사용자 이름은 비워둘 수 없습니다."
        if (isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다."
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors)
        }

        // DB 에서 유저 찾기
        const user = await User.findOneBy({ username })

        if (!user) return res.status(404).json({ username: '사용자 이름이 등록되지 않았습니다.' })
        
        // 유저가 있다면 비밀번호 비교
        const passwordMatches = await bcrypt.compare(password, user.password)

        // 비밀번호가 다르다면 에러 전송
        if (!passwordMatches) {
            return res.status(401).json({ password: '비밀번호가 잘못되었습니다.' })
        }

        // 비밀번호가 맞다면 토큰 생성
        const token = jwt.sign({ username }, process.env.JWT_SECRET)

        // 쿠키저장
        res.set('Set-Cookie', cookie.serialize('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "strict", 
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/", 
        }))

        return res.json({ user, token })

    } catch(error) {
        console.log(error)
        return res.status(500).json({ error })
    }
}

const logout = async (_: Request, res: Response) => {
    res.set(
        "Set-Cookie", 
        cookie.serialize('token', '', {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
            expires: new Date(0), 
            path: '/'
        })
    )
    res.status(200).json({ success: true })
}

const router = Router()
router.get('/me', userMiddleware, authMiddleware, me)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', userMiddleware, authMiddleware, logout)  // logout 할 수 있는 회원인지 검사 후 로그아웃 진행 

export default router;