<?php

function cleanDataSubmit(array $fields, array $post): array
{
   foreach ($fields as $field) {
      if (@$post[$field]) {
         $data[$field] = $post[$field];
      } else {
         $data[$field] = null;
      }
   }
   return $data;
}

function tableSearch($table, array $column_search, array $post)
{
   $i = 0;
   foreach ($column_search as $item) {
      if (@$post['search']) {
         if ($i === 0) {
            $table->groupStart();
            $table->like('trim(lower(cast(' . $item . ' as varchar)))', trim(strtolower($post['search'])));
         } else {
            $table->orLike('trim(lower(cast(' . $item . ' as varchar)))', trim(strtolower($post['search'])));
         }

         if (count($column_search) - 1 === $i) {
            $table->groupEnd();
         }
      }
      $i++;
   }
}
