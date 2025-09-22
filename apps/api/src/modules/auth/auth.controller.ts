import { Body, Controller, Get, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { CurrentUser } from '@common/auth/current-user.decorator';
import { JwtAuthGuard } from '@common/auth/jwt-auth.guard';
import { Roles } from '@common/auth/roles.decorator';
import { Role } from '@common/auth/roles.enum';
import { RolesGuard } from '@common/auth/roles.guard';

import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { RegisterDto } from './dto/register.dto';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private auth: AuthService) {}

	@Post('signup')
	@ApiOperation({ summary: 'Inscription publique (compte en attente)' })
	@ApiResponse({ status: 201, type: SignupResponseDto })
	@ApiResponse({ status: 400, description: 'Email déjà utilisé' })
	signup(@Body() dto: SignupDto): Promise<SignupResponseDto> {
		return this.auth.signup(dto.email, dto.password);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Connexion' })
	@ApiResponse({ status: 200, type: LoginResponseDto })
	@ApiResponse({ status: 401, description: 'Identifiants invalides' })
	@ApiResponse({ status: 403, description: "Compte en attente d'approbation" })
	login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
		return this.auth.login(dto.email, dto.password);
	}

	@Post('register')
	@ApiBearerAuth()
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@ApiOperation({ summary: 'Création de compte par admin (approuvé automatiquement)' })
	@ApiResponse({ status: 201, description: 'Utilisateur créé' })
	@ApiResponse({ status: 400, description: 'Email déjà utilisé' })
	register(@Body() dto: RegisterDto) {
		return this.auth.register(dto.email, dto.password, dto.role);
	}

	@Get('me')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: "Informations de l'utilisateur connecté" })
	@ApiResponse({ status: 200, type: MeResponseDto })
	me(@CurrentUser() user: any): MeResponseDto {
		return user;
	}
}
