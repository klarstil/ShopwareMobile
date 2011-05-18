{if !$register.personal.error_flags}
{['success'=>true, 'msg'=> 'Ihre Registrierung war erfolgreich. Klicken Sie auf "Ok" um fortzufahren.'|utf8_encode, 'view' => 'register/index', 'errors' => $error_messages]|json_encode}
{else}
{['success'=>false, 'msg'=> 'Ihre Registrierung konnte nicht ausgef&uuml;hrt werden. Bitte prüfen Sie Ihre Eingabe.'|utf8_encode, 'view' => 'register/index', 'errors' => $error_messages]|json_encode}
{/if}