import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "src/auth/entities/user.entity";
import { ROLES_KEY } from "../decorators/role.decorator";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private reflector:Reflector){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
         const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY,[
            context.getHandler(),
            context.getClass()
         ])
         
         if(!requiredRoles) return true

         const { user } = context.switchToHttp().getRequest()

         if(!user) return false

         const normalizeRoles = (role:unknown):Role | null => {
            if(!role || typeof role !== 'string' ) return null
            const normalized = role.toLowerCase() as Role
            return((Object.values(Role) as string[]).includes(normalized) ? normalized : null)
         }
    }
}