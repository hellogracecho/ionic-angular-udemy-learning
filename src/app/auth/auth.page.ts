import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { LoadingController, AlertController } from "@ionic/angular";
import { Observable } from "rxjs";

import { AuthService, AuthResponseData } from "./auth.service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"]
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.authentificate(email, password);
    form.reset();
  }

  authentificate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: "Logging in..." })
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }

        authObs.subscribe(
          resData => {
            console.log(resData);
            this.isLoading = false;
            loadingEl.dismiss();
            this.router.navigateByUrl("/places/tabs/discover");
          },
          errRes => {
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            // Convert code into human readable message
            let message = "Could not sign you up, please try again";
            if (code === "EMAIL_EXISTS") {
              message =
                "The email address is already in use by another account.";
            } else if (code === "EMAIL_NOT_FOUND") {
              message =
                "There is no user record corresponding to this identifier. The user may have been deleted.";
            } else if (code === "INVALID_PASSWORD") {
              message =
                "The password is invalid or the user does not have a password.";
            }
            this.showAlert(message);
          }
        );
      });
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: "Athentification failed",
        message: message,
        buttons: ["Okay"]
      })
      .then(alertEl => alertEl.present());
  }
}
