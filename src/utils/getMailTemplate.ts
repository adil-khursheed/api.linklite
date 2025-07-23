export const getTemplate = (options: MailOptions) => {
  const baseTemplate = (content: string) => `
<div style="max-width:37.5em;margin:0 auto;font-family:Arial, sans-serif;background-color:#ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td style="padding:30px 20px;text-align:center;">
        <h2 style="font-size:24px;margin:0;">LinkLite.in</h2>
      </td>
    </tr>
  </table>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td style="padding:0 20px;text-align:center;"> ${content} </td>
    </tr>
  </table>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e0e0e0;">
    <tr>
      <td style="padding:30px 40px;text-align:center;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align:left;padding-bottom:15px;width:66%">
              <img alt="LinkLite.in" height="36" src="https://res.cloudinary.com/ytx/image/upload/v1731270603/Group_124_zru2yd.png" width="120" />
            </td>
            <td style="text-align:right;padding-bottom:15px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="https://x.com/leadlly_ed" target="_blank">
                      <img alt="Twitter" height="32" src="https://res.cloudinary.com/ytx/image/upload/v1731407923/twitter-x_ft91uu.png" width="32" />
                    </a>
                  </td>
                  <td style="padding-right:10px;">
                    <a href="https://www.instagram.com/leadlly.in" target="_blank">
                      <img alt="Instagram" height="32" src="https://res.cloudinary.com/ytx/image/upload/v1731407923/instagram_1_z0cos7.png" width="32" />
                    </a>
                  </td>
                  <td>
                    <a href="https://www.linkedin.com/company/leadlly-edu/" target="_blank">
                      <img alt="LinkedIn" height="32" src="https://res.cloudinary.com/ytx/image/upload/v1731407923/linkdin_igumjq.png" width="32" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size:12px;color:#b7b7b7;text-align:center;padding-top:15px;padding-bottom:15px;">
              <a href="https://www.leadlly.in/terms-and-conditions" style="color:#b7b7b7;text-decoration:underline;" target="_blank">Terms & Conditions</a> | <a href="https://www.leadlly.in/privacy-policy" style="color:#b7b7b7;text-decoration:underline;" target="_blank">Privacy Policy</a> | <a href="https://play.google.com/store/apps/details?id=com.leadlly.app" style="color:#b7b7b7;text-decoration:underline;" target="_blank">Download the App</a>
              <p style="margin-top:20px;">©2022 Leadlly Edusolutions Pvt. Ltd. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
    `;
};
