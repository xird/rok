 v a r   R O K U t i l s   =   r e q u i r e ( " . / p u b l i c / R O K U t i l s . j s " ) ; 
 v a r   u t i l s   =   n e w   R O K U t i l s ( ) ; 
 
 v a r   t h e C a r d s   =   { 
     A C I D _ A T T A C K :                                       1 , 
     A L I E N _ M E T A B O L I S M :                             2 , 
     A L P H A _ M O N S T E R :                                   3 , 
     A P A R T M E N T _ B U I L D I N G :                         4 , 
     A R M O R _ P L A T I N G :                                   5 , 
     B A C K G R O U N D _ D W E L L E R :                         6 , 
     B U R R O W I N G :                                           7 , 
     C A M O U F L A G E :                                         8 , 
     C O M M U T E R _ T R A I N :                                 9 , 
     C O M P L E T E _ D E S T R U C T I O N :                   1 0 , 
     C O R N E R _ S T O R E :                                   1 1 , 
     D E D I C A T E D _ N E W S _ T E A M :                     1 2 , 
     D R O P _ F R O M _ H I G H _ A L T I T U D E :             1 3 , 
     E A T E R _ O F _ T H E _ D E A D :                         1 4 , 
     E N E R G I Z E :                                           1 5 , 
     E N E R G Y _ H O A R D E R :                               1 6 , 
     E V A C U A T I O N _ O R D E R S _ X 1 :                   1 7 , 
     E V A C U A T I O N _ O R D E R S _ X 2 :                   1 8 , 
     E V E N _ B I G G E R :                                     1 9 , 
     E X T R A _ H E A D _ X 1 :                                 2 0 , 
     E X T R A _ H E A D _ X 2 :                                 2 1 , 
     F I R E _ B L A S T :                                       2 2 , 
     F I R E _ B R E A T H I N G :                               2 3 , 
     F R E E Z E _ T I M E :                                     2 4 , 
     F R E N Z Y :                                               2 5 , 
     F R I E N D _ O F _ C H I L D R E N :                       2 6 , 
     G A S _ R E F I N E R Y :                                   2 7 , 
     G I A N T _ B R A I N :                                     2 8 , 
     G O U R M E T :                                             2 9 , 
     H E A L :                                                   3 0 , 
     H E A L I N G _ R A Y :                                     3 1 , 
     H E R B I V O R E :                                         3 2 , 
     H E R D _ C U L L E R :                                     3 3 , 
     H I G H _ A L T I T U D E _ B O M B I N G :                 3 4 , 
     I T _ H A S _ A _ C H I L D :                               3 5 , 
     J E T _ F I G H T E R S :                                   3 6 , 
     J E T S :                                                   3 7 , 
     M A D E _ I N _ A _ L A B :                                 3 8 , 
     M E T A M O R P H :                                         3 9 , 
     M I M I C :                                                 4 0 , 
     M O N S T E R _ B A T T E R I E S :                         4 1 , 
     N A T I O N A L _ G U A R D :                               4 2 , 
     N O V A _ B R E A T H :                                     4 3 , 
     N U C L E A R _ P O W E R _ P L A N T :                     4 4 , 
     O M N I V O R E :                                           4 5 , 
     O P P O R T U N I S T :                                     4 6 , 
     P A R A S I T I C _ T E N T A C L E S :                     4 7 , 
     P L O T _ T W I S T :                                       4 8 , 
     P O I S O N _ Q U I L L S :                                 4 9 , 
     P O I S O N _ S P I T :                                     5 0 , 
     P S Y C H I C _ P R O B E :                                 5 1 , 
     R A P I D _ H E A L I N G :                                 5 2 , 
     R E G E N E R A T I O N :                                   5 3 , 
     R O O T I N G _ F O R _ T H E _ U N D E R D O G :           5 4 , 
     S H R I N K _ R A Y :                                       5 5 , 
     S K Y S C R A P E R :                                       5 6 , 
     S M O K E _ C L O U D :                                     5 7 , 
     S O L A R _ P O W E R E D :                                 5 8 , 
     S P I K E D _ T A I L :                                     5 9 , 
     S T R E T C H Y :                                           6 0 , 
     T A N K S :                                                 6 1 , 
     T E L E P A T H :                                           6 2 , 
     U R B A V O R E :                                           6 3 , 
     V A S T _ S T O R M :                                       6 4 , 
     W E R E _ O N L Y _ M A K I N G _ I T _ S T R O N G E R :   6 5 , 
     W I N G S :                                                 6 6 , 
 
     A M U S E M E N T _ P A R K :                               6 7 , 
     A R M Y :                                                   6 8 , 
     C A N N I B A L I S T I C :                                 6 9 , 
     I N T I M I D A T I N G _ R O A R :                         7 0 , 
     M O N S T E R _ S I D E K I C K :                           7 1 , 
     R E F L E C T I V E _ H I D E :                             7 2 , 
     S L E E P _ W A L K E R :                                   7 3 , 
     S U P E R _ J U M P :                                       7 4 , 
     T H R O W _ A _ T A N K E R :                               7 5 , 
     T H U N D E R _ S T O M P :                                 7 6 , 
     U N S T A B L E _ D N A :                                   7 7 , 
 
     / /   T h i s   p r o p e r t i e s   t a b l e   h a s   b e e n   a d o p t e d   f r o m   M a l t i z e ' s   K i n g O f T o k y o - C a r d L i s t   p r o j e c t   o n   G i t H u b 
     / /   h t t p s : / / g i t h u b . c o m / m a l t i z e / K i n g O f T o k y o - C a r d L i s t 
 
     p r o p e r t i e s :   { 
         1 :   { n a m e :   " A c i d   A t t a c k " ,   c o s t :   6 ,   k e e p :   t r u e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   t r u e ,   d e s c r i p t i o n :   " D e a l   1   e x t r a   d a m a g e   e a c h   t u r n   ( e v e n   w h e n   y o u   d o n ' t   o t h e r w i s e   a t t a c k ) . " , 
                 h o o k s :   { 
                     " R E S O L V E _ A T T A C K _ D I C E " :   f u n c t i o n   ( g a m e ,   a t t a c k a g e )   { 
                         a t t a c k a g e . d a m a g e + + ; 
 
                         u t i l s . l o g ( " D a m a g e :   "   +   a t t a c k a g e . d a m a g e ) ; 
                         r e t u r n   a t t a c k a g e ; 
                     } 
                 } 
               } , 
         2 :   { n a m e :   " A l i e n   M e t a b o l i s m " ,                             c o s t :   3 ,   k e e p :   t r u e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   t r u e ,   d e s c r i p t i o n :   " B u y i n g   c a r d s   c o s t s   y o u   1   l e s s   [ S n o t ] . " , 
                 h o o k s :   { 
                     " B U Y _ C A R D " :   f u n c t i o n ( g a m e ,   c a r d C o s t )   { 
                     c a r d C o s t - - ; 
 
                     u t i l s . l o g ( " C a r d   c o s t :   "   +   c a r d C o s t ) ; 
                     r e t u r n   c a r d C o s t ; 
                 } 
               } 
         } , 
         3 :   { n a m e :   " A l p h a   M o n s t e r " ,   c o s t :   5 ,   k e e p :   t r u e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   t r u e ,   d e s c r i p t i o n :   " G a i n   1 [ S t a r ]   w h e n   y o u   a t t a c k . " , 
                 h o o k s :   { 
                     " R E S O L V E _ A T T A C K _ D I C E " :   f u n c t i o n   ( g a m e ,   a t t a c k a g e )   { 
                     i f   ( a t t a c k a g e . a t t a c k   >   0 ) 
                         g a m e . m o n s t e r s [ g a m e . t u r n _ m o n s t e r ] . a d d V i c t o r y P o i n t s ( 1 ) ; 
 
                         u t i l s . l o g ( " V P s :   "   +   g a m e . m o n s t e r s [ g a m e . t u r n _ m o n s t e r ] . v i c t o r y _ p o i n t s ) ; 
                         r e t u r n   a t t a c k a g e ; 
                     } 
                 } 
               } , 
         4 :   { n a m e :   " A p a r t m e n t   B u i l d i n g " ,                         c o s t :   5 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   3 [ S t a r ] " , 
                 h o o k s :   { 
                     " C A R D _ B O U G H T " :   f u n c t i o n   ( g a m e )   { 
                         g a m e . m o n s t e r s [ g a m e . t u r n _ m o n s t e r ] . a d d V i c t o r y P o i n t s ( 3 ) ; 
 
                         u t i l s . l o g ( " V P s :   "   +   g a m e . m o n s t e r s [ g a m e . t u r n _ m o n s t e r ] . v i c t o r y _ p o i n t s ) ; 
                     } 
                 } 
               } , 
         5 :   { n a m e :   " A r m o r   P l a t i n g " ,                                   c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   t r u e ,     d e s c r i p t i o n :   " I g n o r e   d a m a g e   o f   1 . " , 
                 h o o k s :   { 
                     " A P P L Y _ D A M A G E " :   f u n c t i o n   ( g a m e ,   d a m a g e )   { 
                         i f   ( d a m a g e   = =   1 )   { 
                             d a m a g e   =   0 ; 
                         } 
 
                         u t i l s . l o g ( " D a m a g e :   "   +   d a m a g e ) ; 
                         r e t u r n   d a m a g e ; 
                     } 
                 } 
               } , 
         6 :   { n a m e :   " B a c k g r o u n d   D w e l l e r " ,   c o s t :   4 ,   k e e p :   t r u e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u   c a n   a l w a y s   r e r o l l   a n y   [ 3 ]   y o u   h a v e . " , 
                 h o o k s :   { 
                     " D I C E _ S T A T E " :   f u n c t i o n   ( g a m e ,   d i e )   { 
                         i f   ( d i e . v a l u e   = = =   3 )   { 
                             d i e . s t a t e   =   d i e . s t a t e   = =   ' r '   ?   ' r r '   :   " k r " ;     / /   ' r r '   m e a n s   ' r e - r o l l ( a b l e ) ' .     ' k r '   m e a n s   ' k e e p - r e r o l l a l e ' . 
                         } 
 
                         u t i l s . l o g ( " S t a t e :   "   +   d i e . s t a t e ) ; 
                         r e t u r n   d i e ; 
                     } 
                 } 
               } , 
         7 :   { n a m e :   " B u r r o w i n g " ,                                           c o s t :   5 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " D e a l   1   e x t r a   d a m a g e   o n   T o k y o .   D e a l   1   d a m a g e   w h e n   y i e l d i n g   T o k y o   t o   t h e   m o n s t e r   t a k i n g   i t . " ,   h o o k s :   { } } , 
         8 :   { n a m e :   " C a m o u f l a g e " ,                                         c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " I f   y o u   t a k e   d a m a g e   r o l l   a   d i e   f o r   e a c h   d a m a g e   p o i n t .   O n   a   [ H e a r t ]   y o u   d o   n o t   t a k e   t h a t   d a m a g e   p o i n t . " ,   h o o k s :   { } } , 
         9 :   { n a m e :   " C o m m u t e r   T r a i n " ,                                 c o s t :   4 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   2 [ S t a r ] " ,   h o o k s :   { } } , 
         1 0 :   { n a m e :   " C o m p l e t e   D e s t r u c t i o n " ,                     c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " I f   y o u   r o l l   [ 1 ] [ 2 ] [ 3 ] [ H e a r t ] [ A t t a c k ] [ S n o t ]   g a i n   9 [ S t a r ]   i n   a d d i t i o n   t o   t h e   r e g u l a r   r e s u l t s . " ,   h o o k s :   { } } , 
         1 1 :   { n a m e :   " C o r n e r   S t o r e " ,                                     c o s t :   3 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   1 [ S t a r ] " ,   h o o k s :   { } } , 
         1 2 :   { n a m e :   " D e d i c a t e d   N e w s   T e a m " ,                       c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   " n e e d s _ t e s t i n g " ,   d e s c r i p t i o n :   " G a i n   1 [ S t a r ]   w h e n e v e r   y o u   b u y   a   c a r d . " ,   h o o k s :   { } } , 
         1 3 :   { n a m e :   " D r o p   f r o m   H i g h   A l t i t u d e " ,               c o s t :   5 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   2 [ S t a r ]   a n d   t a k e   c o n t r o l   o f   T o k y o   i f   y o u   d o n ' t   a l r e a d y   c o n t r o l   i t . " ,   h o o k s :   { } } , 
         1 4 :   { n a m e :   " E a t e r   o f   t h e   D e a d " ,                           c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " G a i n   3 [ S t a r ]   e v e r y   t i m e   a   m o n s t e r ' s   [ H e a r t ]   g o e s   t o   0 . " ,   h o o k s :   { } } , 
         1 5 :   { n a m e :   " E n e r g i z e " ,                                             c o s t :   8 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   9 [ S n o t ] " ,   h o o k s :   { } } , 
         1 6 :   { n a m e :   " E n e r g y   H o a r d e r " ,                                 c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u   g a i n   1 [ S t a r ]   f o r   e v e r y   6 [ S n o t ]   y o u   h a v e   a t   t h e   e n d   o f   y o u r   t u r n . " ,   h o o k s :   { } } , 
         1 7 :   { n a m e :   " E v a c u a t i o n   O r d e r s " ,                           c o s t :   7 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " A l l   o t h e r   m o n s t e r s   l o s e   5 [ S t a r ] . " ,   h o o k s :   { } } , 
         1 8 :   { n a m e :   " E v a c u a t i o n   O r d e r s " ,                           c o s t :   7 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " A l l   o t h e r   m o n s t e r s   l o s e   5 [ S t a r ] . " ,   h o o k s :   { } } , 
         1 9 :   { n a m e :   " E v e n   B i g g e r " ,                                       c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u r   m a x i m u m   [ H e a r t ]   i s   i n c r e a s e d   b y   2 .   G a i n   2 [ H e a r t ]   w h e n   y o u   g e t   t h i s   c a r d . " , 
                   h o o k s :   { 
                   } 
                 } , 
         2 0 :   { n a m e :   " E x t r a   H e a d " ,                                         c o s t :   7 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   t r u e ,     d e s c r i p t i o n :   " Y o u   g e t   1   e x t r a   d i e . " ,   h o o k s :   { } } , 
         2 1 :   { n a m e :   " E x t r a   H e a d " ,                                         c o s t :   7 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   t r u e ,     d e s c r i p t i o n :   " Y o u   g e t   1   e x t r a   d i e . " ,   h o o k s :   { } } , 
         2 2 :   { n a m e :   " F i r e   B l a s t " ,                                         c o s t :   3 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " D e a l   2   d a m a g e   t o   a l l   o t h e r   m o n s t e r s . " ,   h o o k s :   { } } , 
         2 3 :   { n a m e :   " F i r e   B r e a t h i n g " ,                                 c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u r   n e i g h b o r s   t a k e   1   e x t r a   d a m a g e   w h e n   y o u   d e a l   d a m a g e " ,   h o o k s :   { } } , 
         2 4 :   { n a m e :   " F r e e z e   T i m e " ,                                       c o s t :   5 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " O n   a   t u r n   w h e r e   y o u   s c o r e   [ 1 ] [ 1 ] [ 1 ] ,   y o u   c a n   t a k e   a n o t h e r   t u r n   w i t h   o n e   l e s s   d i e . " ,   h o o k s :   { } } , 
         2 5 :   { n a m e :   " F r e n z y " ,                                                 c o s t :   7 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   p u r c h a s e   t h i s   c a r d   T a k e   a n o t h e r   t u r n   i m m e d i a t e l y   a f t e r   t h i s   o n e . " ,   h o o k s :   { } } , 
         2 6 :   { n a m e :   " F r i e n d   o f   C h i l d r e n " ,                         c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   g a i n   a n y   [ S n o t ]   g a i n   1   e x t r a   [ S n o t ] . " ,   h o o k s :   { } } , 
         2 7 :   { n a m e :   " G a s   R e f i n e r y " ,                                     c o s t :   6 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   2 [ S t a r ]   a n d   d e a l   3   d a m a g e   t o   a l l   o t h e r   m o n s t e r s . " ,   h o o k s :   { } } , 
         2 8 :   { n a m e :   " G i a n t   B r a i n " ,                                       c o s t :   5 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   t r u e ,     d e s c r i p t i o n :   " Y o u   h a v e   o n e   e x t r a   r e r o l l   e a c h   t u r n . " ,   h o o k s :   { } } , 
         2 9 :   { n a m e :   " G o u r m e t " ,                                               c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   s c o r i n g   [ 1 ] [ 1 ] [ 1 ]   g a i n   2   e x t r a   [ S t a r ] . " ,   h o o k s :   { } } , 
         3 0 :   { n a m e :   " H e a l " ,                                                     c o s t :   3 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " H e a l   2   d a m a g e . " ,   h o o k s :   { } } , 
         3 1 :   { n a m e :   " H e a l i n g   R a y " ,                                       c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u   c a n   h e a l   o t h e r   m o n s t e r s   w i t h   y o u r   [ H e a r t ]   r e s u l t s .   T h e y   m u s t   p a y   y o u   2 [ S n o t ]   f o r   e a c h   d a m a g e   y o u   h e a l   ( o r   t h e i r   r e m a i n i n g   [ S n o t ]   i f   t h e y   h a v e n ' t   g o t   e n o u g h . " ,   h o o k s :   { } } , 
         3 2 :   { n a m e :   " H e r b i v o r e " ,                                           c o s t :   5 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " G a i n   1 [ S t a r ]   o n   y o u r   t u r n   i f   y o u   d o n ' t   d a m a g e   a n y o n e . " ,   h o o k s :   { } } , 
         3 3 :   { n a m e :   " H e r d   C u l l e r " ,                                       c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u   c a n   c h a n g e   o n e   o f   y o u r   d i c e   t o   a   [ 1 ]   e a c h   t u r n . " ,   h o o k s :   { } } , 
         3 4 :   { n a m e :   " H i g h   A l t i t u d e   B o m b i n g " ,                   c o s t :   4 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " A l l   m o n s t e r s   ( i n c l u d i n g   y o u )   t a k e   3   d a m a g e . " ,   h o o k s :   { } } , 
         3 5 :   { n a m e :   " I t   H a s   a   C h i l d " ,                                 c o s t :   7 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " I f   y o u   a r e   e l i m i n a t e d   d i s c a r d   a l l   y o u r   c a r d s   a n d   l o s e   a l l   y o u r   [ S t a r ] ,   H e a l   t o   1 0 [ H e a r t ]   a n d   s t a r t   a g a i n . " ,   h o o k s :   { } } , 
         3 6 :   { n a m e :   " J e t   F i g h t e r s " ,                                     c o s t :   5 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   5 [ S t a r ]   a n d   t a k e   4   d a m a g e " ,   h o o k s :   { } } , 
         3 7 :   { n a m e :   " J e t s " ,                                                     c o s t :   5 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u   s u f f e r   n o   d a m a g e   w h e n   y i e l d i n g   T o k y o . " ,   h o o k s :   { } } , 
         3 8 :   { n a m e :   " M a d e   i n   a   L a b " ,                                   c o s t :   2 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   p u r c h a s i n g   c a r d s   y o u   c a n   p e e k   a t   a n d   p u r c h a s e   t h e   t o p   c a r d   o f   t h e   d e c k . " ,   h o o k s :   { } } , 
         3 9 :   { n a m e :   " M e t a m o r p h " ,                                           c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " A t   t h e   e n d   o f   y o u r   t u r n   y o u   c a n   d i s c a r d   a n y   k e e p   c a r d s   y o u   h a v e   t o   r e c e i v e   t h e   [ S n o t ]   t h e y   w e r e   p u r c h a s e d   f o r . " ,   h o o k s :   { } } , 
         4 0 :   { n a m e :   " M i m i c " ,                                                   c o s t :   8 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " C h o o s e   a   c a r d   a n y   m o n s t e r   h a s   i n   p l a y   a n d   p u t   a   m i m i c   c o u n t e r   o n   i t .   T h i s   c a r d   c o u n t s   a s   a   d u p l i c a t e   o f   t h a t   c a r d   a s   i f   i t   j u s t   h a d   b e e n   b o u g h t .   S p e n d   1 [ S n o t ]   a t   t h e   s t a r t   o f   y o u r   t u r n   t o   c h a n g e   t h e   p o w e r   y o u   a r e   m i m i c k i n g . " ,   h o o k s :   { } } , 
         4 1 :   { n a m e :   " M o n s t e r   B a t t e r i e s " ,                           c o s t :   2 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   p u r c h a s e   t h i s   p u t   a s   m a n y   [ S n o t ]   a s   y o u   w a n t   o n   i t   f r o m   y o u r   r e s e r v e .   M a t c h   t h i s   f r o m   t h e   b a n k .   A t   t h e   s t a r t   o f   e a c h   t u r n   t a k e   2 [ S n o t ]   o f f   a n d   a d d   t h e m   t o   y o u r   r e s e r v e .   W h e n   t h e r e   a r e   n o   [ S n o t ]   l e f t   d i s c a r d   t h i s   c a r d . " ,   h o o k s :   { } } , 
         4 2 :   { n a m e :   " N a t i o n a l   G u a r d " ,                                 c o s t :   3 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   2 [ S t a r ]   a n d   t a k e   2   d a m a g e . " ,   h o o k s :   { } } , 
         4 3 :   { n a m e :   " N o v a   B r e a t h " ,                                       c o s t :   7 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u r   a t t a c k s   d a m a g e   a l l   o t h e r   m o n s t e r s . " ,   h o o k s :   { } } , 
         4 4 :   { n a m e :   " N u c l e a r   P o w e r   P l a n t " ,                       c o s t :   6 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   2 [ S t a r ]   a n d   h e a l   3   d a m a g e . " ,   h o o k s :   { } } , 
         4 5 :   { n a m e :   " O m n i v o r e " ,                                             c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " O n c e   e a c h   t u r n   y o u   c a n   s c o r e   [ 1 ] [ 2 ] [ 3 ]   f o r   2 [ S t a r ] .   Y o u   c a n   u s e   t h e s e   d i c e   i n   o t h e r   c o m b i n a t i o n s . " ,   h o o k s :   { } } , 
         4 6 :   { n a m e :   " O p p o r t u n i s t " ,                                       c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n e v e r   a   n e w   c a r d   i s   r e v e a l e d   y o u   h a v e   t h e   o p t i o n   o f   p u r c h a s i n g   i t   a s   s o o n   a s   i t   i s   r e v e a l e d . " ,   h o o k s :   { } } , 
         4 7 :   { n a m e :   " P a r a s i t i c   T e n t a c l e s " ,                       c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u   c a n   p u r c h a s e   c a r d s   f r o m   o t h e r   m o n s t e r s .   P a y   t h e m   t h e   [ S n o t ]   c o s t . " ,   h o o k s :   { } } , 
         4 8 :   { n a m e :   " P l o t   T w i s t " ,                                         c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " C h a n g e   o n e   d i e   t o   a n y   r e s u l t .   D i s c a r d   w h e n   u s e d . " ,   h o o k s :   { } } , 
         4 9 :   { n a m e :   " P o i s o n   Q u i l l s " ,                                   c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   s c o r e   [ 2 ] [ 2 ] [ 2 ]   a l s o   d e a l   2   d a m a g e . " ,   h o o k s :   { } } , 
         5 0 :   { n a m e :   " P o i s o n   S p i t " ,                                       c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   d e a l   d a m a g e   t o   m o n s t e r s   g i v e   t h e m   a   p o i s o n   c o u n t e r .   M o n s t e r s   t a k e   1   d a m a g e   f o r   e a c h   p o i s o n   c o u n t e r   t h e y   h a v e   a t   t h e   e n d   o f   t h e i r   t u r n .   Y o u   c a n   g e t   r i d   o f   a   p o i s o n   c o u n t e r   w i t h   a   [ H e a r t ]   ( t h a t   [ H e a r t ]   d o e s n ' t   h e a l   a   d a m a g e   a l s o ) . " ,   h o o k s :   { } } , 
         5 1 :   { n a m e :   " P s y c h i c   P r o b e " ,                                   c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u   c a n   r e r o l l   a   d i e   o f   e a c h   o t h e r   m o n s t e r   o n c e   e a c h   t u r n .   I f   t h e   r e r o l l   i s   [ H e a r t ]   d i s c a r d   t h i s   c a r d . " ,   h o o k s :   { } } , 
         5 2 :   { n a m e :   " R a p i d   H e a l i n g " ,                                   c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " S p e n d   2 [ S n o t ]   a t   a n y   t i m e   t o   h e a l   1   d a m a g e . " ,   h o o k s :   { } } , 
         5 3 :   { n a m e :   " R e g e n e r a t i o n " ,                                     c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   h e a l ,   h e a l   1   e x t r a   d a m a g e . " ,   h o o k s :   { } } , 
         5 4 :   { n a m e :   " R o o t i n g   f o r   t h e   U n d e r d o g " ,             c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " A t   t h e   e n d   o f   a   t u r n   w h e n   y o u   h a v e   t h e   f e w e s t   [ S t a r ]   g a i n   1   [ S t a r ] . " ,   h o o k s :   { } } , 
         5 5 :   { n a m e :   " S h r i n k   R a y " ,                                         c o s t :   6 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   d e a l   d a m a g e   t o   m o n s t e r s   g i v e   t h e m   a   s h r i n k   c o u n t e r .   A   m o n s t e r   r o l l s   o n e   l e s s   d i e   f o r   e a c h   s h r i n k   c o u n t e r .   Y o u   c a n   g e t   r i d   o f   a   s h r i n k   c o u n t e r   w i t h   a   [ H e a r t ]   ( t h a t   [ H e a r t ]   d o e s n ' t   h e a l   a   d a m a g e   a l s o ) . " ,   h o o k s :   { } } , 
         5 6 :   { n a m e :   " S k y s c r a p e r " ,                                         c o s t :   6 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   4 [ S t a r ] " ,   h o o k s :   { } } , 
         5 7 :   { n a m e :   " S m o k e   C l o u d " ,                                       c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " T h i s   c a r d   s t a r t s   w i t h   3   c h a r g e s .   S p e n d   a   c h a r g e   f o r   a n   e x t r a   r e r o l l .   D i s c a r d   t h i s   c a r d   w h e n   a l l   c h a r g e s   a r e   s p e n t . " ,   h o o k s :   { } } , 
         5 8 :   { n a m e :   " S o l a r   P o w e r e d " ,                                   c o s t :   2 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " A t   t h e   e n d   o f   y o u r   t u r n   g a i n   1 [ S n o t ]   i f   y o u   h a v e   n o   [ S n o t ] . " ,   h o o k s :   { } } , 
         5 9 :   { n a m e :   " S p i k e d   T a i l " ,                                       c o s t :   5 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   a t t a c k   d e a l   1   e x t r a   d a m a g e . " ,   h o o k s :   { } } , 
         6 0 :   { n a m e :   " S t r e t c h y " ,                                             c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " Y o u   c a n   s p e n d   2 [ S n o t ]   t o   c h a n g e   o n e   o f   y o u r   d i c e   t o   a n y   r e s u l t . " ,   h o o k s :   { } } , 
         6 1 :   { n a m e :   " T a n k s " ,                                                   c o s t :   4 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   4 [ S t a r ]   a n d   t a k e   3   d a m a g e . " ,   h o o k s :   { } } , 
         6 2 :   { n a m e :   " T e l e p a t h " ,                                             c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " S p e n d   1 [ S n o t ]   t o   g e t   1   e x t r a   r e r o l l . " ,   h o o k s :   { } } , 
         6 3 :   { n a m e :   " U r b a v o r e " ,                                             c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " G a i n   1   e x t r a   [ S t a r ]   w h e n   b e g i n n i n g   t h e   t u r n   i n   T o k y o .   D e a l   1   e x t r a   d a m a g e   w h e n   d e a l i n g   a n y   d a m a g e   f r o m   T o k y o . " ,   h o o k s :   { } } , 
         6 4 :   { n a m e :   " V a s t   S t o r m " ,                                         c o s t :   6 ,   k e e p :   f a l s e ,   s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   2 [ S t a r ] .   A l l   o t h e r   m o n s t e r s   l o s e   1 [ S n o t ]   f o r   e v e r y   2 [ S n o t ]   t h e y   h a v e . " ,   h o o k s :   { } } , 
         6 5 :   { n a m e :   " W e ' r e   O n l y   M a k i n g   I t   S t r o n g e r " ,   c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   l o s e   2 [ H e a r t ]   o r   m o r e   g a i n   1 [ S n o t ] . " ,   h o o k s :   { } } , 
         6 6 :   { n a m e :   " W i n g s " ,                                                   c o s t :   6 ,   k e e p :   t r u e ,     s e t :   " o r i g i n a l " ,   i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " S p e n d   2 [ S n o t ]   t o   n e g a t e   d a m a g e   t o   y o u   f o r   a   t u r n . " ,   h o o k s :   { } } , 
 
         6 7 :   { n a m e :   " A m u s e m e n t   P a r k " ,                                 c o s t :   6 ,   k e e p :   f a l s e ,   s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " +   4 [ S t a r ] " ,   h o o k s :   { } } , 
         6 8 :   { n a m e :   " A r m y " ,                                                     c o s t :   2 ,   k e e p :   f a l s e ,   s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " ( +   1 [ S t a r ]   a n d   s u f f e r   o n e   d a m a g e )   f o r   e a c h   c a r d   y o u   h a v e . " ,   h o o k s :   { } } , 
         6 9 :   { n a m e :   " C a n n i b a l i s t i c " ,                                   c o s t :   5 ,   k e e p :   t r u e ,     s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " W h e n   y o u   d o   d a m a g e   g a i n   1 [ H e a r t ] . " ,   h o o k s :   { } } , 
         7 0 :   { n a m e :   " I n t i m i d a t i n g   R o a r " ,                           c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " T h e   m o n s t e r s   i n   T o k y o   m u s t   y i e l d   i f   y o u   d a m a g e   t h e m . " ,   h o o k s :   { } } , 
         7 1 :   { n a m e :   " M o n s t e r   S i d e k i c k " ,                             c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " I f   s o m e o n e   k i l l s   y o u ,   G o   b a c k   t o   1 0 [ H e a r t ]   a n d   l o s e   a l l   y o u r   [ S t a r ] .   I f   e i t h e r   o f   y o u   o r   y o u r   k i l l e r   w i n ,   o r   a l l   o t h e r   p l a y e r s   a r e   e l i m i n a t e d   t h e n   y o u   b o t h   w i n .   I f   y o u r   k i l l e r   i s   e l i m i n a t e d   t h e n   y o u   a r e   a l s o .   I f   y o u   a r e   e l i m i n a t e d   a   s e c o n d   t i m e   t h i s   c a r d   h a s   n o   e f f e c t . " ,   h o o k s :   { } } , 
         7 2 :   { n a m e :   " R e f l e c t i v e   H i d e " ,                               c o s t :   6 ,   k e e p :   t r u e ,     s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " I f   y o u   s u f f e r   d a m a g e   t h e   m o n s t e r   t h a t   i n f l i c t e d   t h e   d a m a g e   s u f f e r s   1   a s   w e l l . " ,   h o o k s :   { } } , 
         7 3 :   { n a m e :   " S l e e p   W a l k e r " ,                                     c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " S p e n d   3 [ S n o t ]   t o   g a i n   1 [ S t a r ] . " ,   h o o k s :   { } } , 
         7 4 :   { n a m e :   " S u p e r   J u m p " ,                                         c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " O n c e   e a c h   t u r n   y o u   m a y   s p e n d   1 [ S n o t ]   t o   n e g a t e   1   d a m a g e   y o u   a r e   r e c e i v i n g . " ,   h o o k s :   { } } , 
         7 5 :   { n a m e :   " T h r o w   a   T a n k e r " ,                                 c o s t :   4 ,   k e e p :   t r u e ,     s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " O n   a   t u r n   y o u   d e a l   3   o r   m o r e   d a m a g e   g a i n   2 [ S t a r ] . " ,   h o o k s :   { } } , 
         7 6 :   { n a m e :   " T h u n d e r   S t o m p " ,                                   c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " I f   y o u   s c o r e   4 [ S t a r ]   i n   a   t u r n ,   a l l   p l a y e r s   r o l l   o n e   l e s s   d i e   u n t i l   y o u r   n e x t   t u r n . " ,   h o o k s :   { } } , 
         7 7 :   { n a m e :   " U n s t a b l e   D N A " ,                                     c o s t :   3 ,   k e e p :   t r u e ,     s e t :   " p r o m o " ,         i m p l e m e n t e d :   f a l s e ,   d e s c r i p t i o n :   " I f   y o u   y i e l d   T o k y o   y o u   c a n   t a k e   a n y   c a r d   t h e   r e c i p i e n t   h a s   a n d   g i v e   h i m   t h i s   c a r d . " , 
                   h o o k s :   { } 
                 } 
         } 
     } ; 
 
 m o d u l e . e x p o r t s   =   t h e C a r d s ;