import { Injectable } from "@angular/core";
import { CanLoad, Route, UrlSegment, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { take, tap, switchMap } from "rxjs/operators";

import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.userIsAuthenticated.pipe(
      take(1),
      switchMap(isAuthentificated => {
        if (!isAuthentificated) {
          return this.authService.autoLogin();
        } else {
          return of(isAuthentificated);
        }
      }),
      tap(isAuthentificated => {
        if (!isAuthentificated) {
          this.router.navigateByUrl("/auth");
        }
      })
    );
  }
}
