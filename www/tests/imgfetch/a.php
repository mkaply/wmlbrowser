<?php

session_start();

$rand = rand(1,2);

if ( $rand > 1 )
{
	setcookie("test", "dog");
	header( "Location: http://wmlbrowser.mozdev.org/tests/imgfetch/perro_chico.gif" );
}
else
{
	setcookie("test", "cat");
	header( "Location: http://wmlbrowser.mozdev.org/tests/imgfetch/gato_chico.gif" );
}

?>
